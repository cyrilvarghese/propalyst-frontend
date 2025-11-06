'use client'

export default function CompletionAlert() {
  return (
    <div className="flex justify-center animate-fade-out">
      <div className="bg-gradient-to-r from-primary/20 to-accent/10 border border-primary rounded-2xl p-6 shadow-sm">
        <div className="text-center">
          <div className="text-2xl mb-2">🎉</div>
          <div className="text-gray-900 font-semibold mb-1">
            Perfect! We have everything we need
          </div>
          <div className="text-sm text-gray-600">
            Analyzing the best areas for you...
          </div>
        </div>
      </div>
    </div>
  )
}
