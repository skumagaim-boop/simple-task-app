import test from 'node:test';
import assert from 'node:assert/strict';
import {validateTask,validateFiles,parseOutput,providerRequest,providerText} from './runner.mjs';
test('task input validation',()=>{validateTask('1','anthropic','implement');for(const issue of ['0','-1','1;echo','abc'])assert.throws(()=>validateTask(issue,'anthropic','implement'));assert.throws(()=>validateTask('1','unknown','review'));});
test('restrict generated paths and change size',()=>{validateFiles([{path:'src/a.ts',content:'export {}'}]);for(const path of ['../a.ts','src/../a.ts','src//a.ts','.github/workflows/x.yml','package.json','src/.env','src/a.ts/../../x.ts'])assert.throws(()=>validateFiles([{path,content:'x'}]));assert.throws(()=>validateFiles([{path:'src/a.ts',content:'x'.repeat(150001)}]));assert.throws(()=>validateFiles([{path:'src/a.ts',content:''},{path:'src/a.ts',content:''}]));});
test('strict output contract',()=>{assert.equal(parseOutput('{"summary":"ok","files":[{"path":"src/a.ts","content":"x"}]}','implement').summary,'ok');assert.throws(()=>parseOutput('{"summary":"ok","files":[]}','implement'));assert.throws(()=>parseOutput('{"summary":"ok"}','review'));});
test('provider API adapters',()=>{const a=providerRequest('anthropic','model','task','secret');assert.equal(a.headers['x-api-key'],'secret');assert.equal(a.body.messages[0].content,'task');const g=providerRequest('gemini','model','task','secret');assert.equal(g.headers['x-goog-api-key'],'secret');assert.equal(g.body.generationConfig.responseMimeType,'application/json');assert.equal(providerText('anthropic',{content:[{type:'text',text:'ok'}],stop_reason:'end_turn'}),'ok');assert.throws(()=>providerText('anthropic',{stop_reason:'max_tokens'}));assert.throws(()=>providerText('gemini',{candidates:[{finishReason:'MAX_TOKENS'}]}));});

import {main} from './runner.mjs';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
test('end-to-end orchestration using mocked HTTP: dry run, PR and failure evidence',async()=>{
  const originalCwd=process.cwd(), originalFetch=globalThis.fetch, originalEnv={...process.env};
  const dir=await mkdtemp(path.join(tmpdir(),'ai-team-test-'));
  try {
    process.chdir(dir);
    await mkdir('src');await writeFile('src/a.ts','export const a=1;');
    const sha='fixture-sha', calls=[];
    const git=args=>args[0]==='rev-parse'?sha:args.includes('-z')?'src/a.ts\0':'100644 blob 0\tsrc/a.ts';
    Object.assign(process.env,{TASK_ISSUE:'7',AI_PROVIDER:'anthropic',AI_ROLE:'implement',DRY_RUN:'true',GITHUB_REPOSITORY:'owner/repo',GITHUB_ACTOR:'owner',GH_TOKEN:'fake-github',GITHUB_RUN_ID:'123',GITHUB_RUN_ATTEMPT:'1',GITHUB_OUTPUT:path.join(dir,'out'),GITHUB_STEP_SUMMARY:path.join(dir,'summary'),ANTHROPIC_API_KEY:'fake-key',ANTHROPIC_MODEL:'test-model'});
    globalThis.fetch=async(url,options)=>{
      calls.push({url,options});
      let result;
      if(url.includes('/issues/7'))result={number:7,title:'Change a',body:'Set a to 2',state:'open'};
      else if(url.includes('/collaborators/'))result={permission:'write'};
      else if(url==='https://api.anthropic.com/v1/messages')result={stop_reason:'end_turn',usage:{input_tokens:1,output_tokens:2},content:[{type:'text',text:JSON.stringify({summary:'Changed a',files:[{path:'src/a.ts',content:'export const a=2;'}]})}]};
      else if(url.endsWith('/repos/owner/repo'))result={default_branch:'main'};
      else if(url.includes('/git/ref/heads/'))result={object:{sha}};
      else if(url.endsWith('/git/commits/'+sha))result={tree:{sha:'base-tree'}};
      else if(url.endsWith('/git/blobs'))result={sha:'blob'};
      else if(url.endsWith('/git/trees'))result={sha:'new-tree'};
      else if(url.endsWith('/git/commits'))result={sha:'new-commit'};
      else if(url.endsWith('/git/refs'))result={ref:'branch'};
      else if(url.endsWith('/pulls'))result={html_url:'https://github.com/owner/repo/pull/8'};
      else throw Error('Unexpected URL '+url);
      return new Response(JSON.stringify(result),{status:200});
    };
    await main({git});
    assert.equal(JSON.parse(await readFile('ai-team-evidence.json','utf8')).status,'dry_run_passed');
    assert.equal(calls.length,4);
    process.env.DRY_RUN='false';await main({git});
    const evidence=JSON.parse(await readFile('ai-team-evidence.json','utf8'));
    assert.equal(evidence.status,'draft_pr_created');
    assert.equal(evidence.pr_url,'https://github.com/owner/repo/pull/8');
    assert.match(await readFile(process.env.GITHUB_OUTPUT,'utf8'),/branch=ai-team\/anthropic\/issue-7-123/);
    assert.equal(await readFile('src/a.ts','utf8'),'export const a=1;');
    assert.equal((await readFile('ai-team-evidence.json','utf8')).includes('fake-key'),false);
    delete process.env.ANTHROPIC_API_KEY;
    await assert.rejects(main({git}),/Configure ANTHROPIC/);
    assert.equal(JSON.parse(await readFile('ai-team-evidence.json','utf8')).status,'failed');
  } finally {
    globalThis.fetch=originalFetch;process.chdir(originalCwd);
    for(const key of Object.keys(process.env))if(!(key in originalEnv))delete process.env[key];
    Object.assign(process.env,originalEnv);
    await rm(dir,{recursive:true,force:true});
  }
});
