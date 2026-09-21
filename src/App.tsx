import { FormEvent, useEffect, useRef, useState } from 'react'
import { taskStorage, type Task } from './storage'

type Filter = 'all' | 'active' | 'completed'
const labels: Record<Filter, string> = { all: 'すべて', active: '未完了', completed: '完了' }

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Task | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const addInput = useRef<HTMLInputElement>(null)

  const load = async () => {
    setLoading(true); setError('')
    try { setTasks(await taskStorage.load()) }
    catch { setError('タスクを読み込めませんでした。もう一度お試しください。') }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [])

  const commit = async (next: Task[], previous: Task[]) => {
    setTasks(next); setError('')
    try { await taskStorage.save(next); return true }
    catch { setTasks(previous); setError('変更を保存できませんでした。もう一度お試しください。'); return false }
  }
  const add = async (event: FormEvent) => {
    event.preventDefault()
    const value = title.trim()
    if (!value) { setError('タスク名を入力してください。'); addInput.current?.focus(); return }
    if (value.length > 100) { setError('タスク名は100文字以内で入力してください。'); return }
    const next = [{ id: crypto.randomUUID(), title: value, completed: false, createdAt: Date.now() }, ...tasks]
    if (await commit(next, tasks)) setTitle('')
    addInput.current?.focus()
  }
  const toggle = (task: Task) => void commit(tasks.map(item => item.id === task.id ? { ...item, completed: !item.completed } : item), tasks)
  const remove = (task: Task) => {
    if (window.confirm(`「${task.title}」を削除しますか？`)) void commit(tasks.filter(item => item.id !== task.id), tasks)
  }
  const beginEdit = (task: Task) => { setEditing(task); setEditTitle(task.title); setError('') }
  const saveEdit = async (event: FormEvent) => {
    event.preventDefault(); if (!editing) return
    const value = editTitle.trim()
    if (!value) { setError('タスク名を入力してください。'); return }
    if (value.length > 100) { setError('タスク名は100文字以内で入力してください。'); return }
    const saved = await commit(tasks.map(item => item.id === editing.id ? { ...item, title: value } : item), tasks)
    if (saved) setEditing(null)
  }
  const visible = tasks.filter(task => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed))
  const activeCount = tasks.filter(task => !task.completed).length

  return <main>
    <header><div className="brand"><span aria-hidden="true">✓</span> Taskly</div><p>今日やることを、シンプルに。</p></header>
    <section className="panel" aria-labelledby="task-heading">
      <h1 id="task-heading">マイタスク</h1>
      <form className="add-form" onSubmit={add} noValidate>
        <label className="sr-only" htmlFor="new-task">新しいタスク</label>
        <input id="new-task" ref={addInput} value={title} onChange={e => setTitle(e.target.value)} placeholder="新しいタスクを入力…" maxLength={101} disabled={loading} />
        <button className="primary" disabled={loading}><span aria-hidden="true">＋</span> 追加</button>
      </form>
      {error && <div className="error" role="alert"><span>{error}</span>{loading === false && tasks.length === 0 && <button onClick={() => void load()}>再試行</button>}</div>}
      <nav className="filters" aria-label="タスクの表示切替">
        {(Object.keys(labels) as Filter[]).map(key => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{labels[key]} <span>{key === 'all' ? tasks.length : tasks.filter(t => key === 'completed' ? t.completed : !t.completed).length}</span></button>)}
      </nav>
      {loading ? <div className="state" role="status"><span className="spinner" />タスクを読み込んでいます…</div> : visible.length === 0 ? <div className="state empty"><div aria-hidden="true">✓</div><h2>{tasks.length ? `${labels[filter]}のタスクはありません` : 'タスクはまだありません'}</h2><p>{tasks.length ? '別の表示に切り替えてみましょう。' : '上の入力欄から最初のタスクを追加しましょう。'}</p></div> :
        <ul className="task-list">{visible.map(task => <li key={task.id}>
          {editing?.id === task.id ? <form className="edit-form" onSubmit={saveEdit}><label className="sr-only" htmlFor={`edit-${task.id}`}>タスク名を編集</label><input id={`edit-${task.id}`} autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)} onKeyDown={e => { if (e.key === 'Escape') setEditing(null) }} /><button className="primary">保存</button><button type="button" onClick={() => setEditing(null)}>キャンセル</button></form> : <>
            <label className="task-check"><input type="checkbox" checked={task.completed} onChange={() => toggle(task)} /><span className="checkmark" aria-hidden="true"/><span className={task.completed ? 'done' : ''}>{task.title}</span></label>
            <div className="actions"><button aria-label={`${task.title}を編集`} onClick={() => beginEdit(task)}>編集</button><button className="danger" aria-label={`${task.title}を削除`} onClick={() => remove(task)}>削除</button></div>
          </>}
        </li>)}</ul>}
      {!loading && tasks.length > 0 && <footer><strong>{activeCount}</strong> 件の未完了タスク</footer>}
    </section>
    <p className="hint">ヒント：Tab キーで移動し、Enter キーで操作できます</p>
  </main>
}
