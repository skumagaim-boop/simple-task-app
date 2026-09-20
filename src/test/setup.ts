import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks() })
Object.defineProperty(globalThis, 'crypto', { value: { randomUUID: vi.fn(() => `task-${Date.now()}`) } })
