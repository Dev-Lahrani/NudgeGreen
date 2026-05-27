import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dir, 'nudgegreen.db'))
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

export default db
