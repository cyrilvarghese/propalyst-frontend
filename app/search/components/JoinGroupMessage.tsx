'use client'

import { Button } from '@/components/ui/button'
import { MessageCircle } from 'lucide-react'

export default function JoinGroupMessage() {
    return (
        <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 p-4 shadow-sm mb-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-800">
                        Submit to our database
                    </h3>
                    <p className="text-xs text-slate-500">
                        Send a message in our WhatsApp group to add your listing or requirement.
                    </p>
                </div>
            </div>

            <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs font-medium border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                onClick={() => window.open('https://chat.whatsapp.com/J827YjNq8RU5Zwf0NWhXHY?mode=hqrt1', '_blank')}
            >
                Join Group
            </Button>
        </div>
    )
}
