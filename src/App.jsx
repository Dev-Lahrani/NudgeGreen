import InputForm from './components/InputForm'

export default function App() {
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <InputForm onSubmit={console.log} loading={false} />
    </div>
  )
}
