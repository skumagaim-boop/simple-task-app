import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { taskStorage, type Task } from './storage'

const existing: Task[] = [
  { id: '1', title: '未完了タスク', completed: false, createdAt: 2 },
  { id: '2', title: '完了タスク', completed: true, createdAt: 1 },
]

describe('主要なタスク操作', () => {
  beforeEach(() => localStorage.setItem('taskly.tasks', JSON.stringify(existing)))
  it('読み込み中を表示してから保存済みタスクを表示する', async () => {
    let resolve!: (tasks: Task[]) => void
    vi.spyOn(taskStorage, 'load').mockReturnValue(new Promise(value => { resolve = value }))
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('読み込んでいます')
    resolve(existing)
    expect(await screen.findByText('未完了タスク')).toBeInTheDocument()
  })
  it('登録、編集、完了切替、削除ができる', async () => {
    const user = userEvent.setup(); vi.spyOn(window, 'confirm').mockReturnValue(true); render(<App />)
    const input = await screen.findByLabelText('新しいタスク')
    await user.type(input, '買い物{Enter}')
    expect(screen.getByText('買い物')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '買い物を編集' }))
    const edit = screen.getByLabelText('タスク名を編集'); await user.clear(edit); await user.type(edit, '牛乳を買う{Enter}')
    const checkbox = screen.getByRole('checkbox', { name: /牛乳を買う/ }); await user.click(checkbox); expect(checkbox).toBeChecked()
    await user.click(screen.getByRole('button', { name: '牛乳を買うを削除' }))
    expect(screen.queryByText('牛乳を買う')).not.toBeInTheDocument()
  })
  it('完了／未完了一覧を切り替える', async () => {
    const user = userEvent.setup(); render(<App />); await screen.findByText('未完了タスク')
    await user.click(screen.getByRole('button', { name: /^完了/ }))
    expect(screen.getByText('完了タスク')).toBeVisible(); expect(screen.queryByText('未完了タスク')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /^未完了/ }))
    expect(screen.getByText('未完了タスク')).toBeVisible(); expect(screen.queryByText('完了タスク')).not.toBeInTheDocument()
  })
  it('空入力と長すぎる入力を検証する', async () => {
    const user = userEvent.setup(); render(<App />); await screen.findByText('未完了タスク')
    await user.click(screen.getByRole('button', { name: /追加/ })); expect(screen.getByRole('alert')).toHaveTextContent('入力してください')
    await user.type(screen.getByLabelText('新しいタスク'), 'あ'.repeat(101)); await user.click(screen.getByRole('button', { name: /追加/ }))
    expect(screen.getByRole('alert')).toHaveTextContent('100文字以内')
  })
  it('Escapeで編集をキャンセルでき、キーボードで登録できる', async () => {
    const user = userEvent.setup(); render(<App />); await screen.findByText('未完了タスク')
    await user.click(screen.getByRole('button', { name: '未完了タスクを編集' })); await user.type(screen.getByLabelText('タスク名を編集'), '{Escape}')
    expect(screen.queryByLabelText('タスク名を編集')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('新しいタスク'), 'キーボード登録{Enter}'); expect(screen.getByText('キーボード登録')).toBeVisible()
  })
})

describe('状態とエラー', () => {
  it('空状態を表示する', async () => { render(<App />); expect(await screen.findByRole('heading', { name: 'タスクはまだありません' })).toBeVisible() })
  it('読み込みエラーと再試行を表示する', async () => {
    vi.spyOn(taskStorage, 'load').mockRejectedValueOnce(new Error('failed')).mockResolvedValueOnce([]); render(<App />)
    expect(await screen.findByRole('alert')).toHaveTextContent('読み込めませんでした')
    await userEvent.click(screen.getByRole('button', { name: '再試行' })); expect(await screen.findByText('タスクはまだありません')).toBeVisible()
  })
  it('保存エラーでは変更を戻して通知する', async () => {
    vi.spyOn(taskStorage, 'save').mockRejectedValue(new Error('failed')); render(<App />); await screen.findByText('タスクはまだありません')
    await userEvent.type(screen.getByLabelText('新しいタスク'), '保存できない{Enter}')
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('保存できませんでした'))
    expect(screen.queryByText('保存できない')).not.toBeInTheDocument()
  })
})
