export default function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4 py-12">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
      <p className="text-green-700 font-medium">Analyzing environmental impact...</p>
    </div>
  )
}
