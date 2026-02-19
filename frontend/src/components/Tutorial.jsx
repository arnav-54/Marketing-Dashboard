import { useState } from 'react'
import { Sparkles, HelpCircle, ChevronRight, X } from 'lucide-react'

export default function Tutorial({ onComplete }) {
    const [step, setStep] = useState(0)

    const steps = [
        {
            title: "Welcome to MarketingOS",
            text: "This dashboard gives you real-time insights into your marketing spend and performance across all channels.",
            icon: <Sparkles className="text-purple-500" />
        },
        {
            title: "Performance Summary",
            text: "Get a high-level view of your ROI, ROAS, and conversions at a glance.",
            icon: <HelpCircle className="text-blue-500" />
        },
        {
            title: "Budget Simulator",
            text: "Experiment with budget reallocations to see how they impact your projected revenue.",
            icon: <ChevronRight className="text-green-500" />
        }
    ]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            onComplete()
        }
    }

    return (
        <div className="tutorial-overlay">
            <div className="tutorial-card">
                <button className="tutorial-skip" onClick={onComplete} aria-label="Skip Tutorial">
                    <X size={18} />
                </button>
                <div className="tutorial-icon-box">
                    {steps[step].icon}
                </div>
                <h3>{steps[step].title}</h3>
                <p>{steps[step].text}</p>

                <div className="tutorial-footer">
                    <div className="tutorial-dots">
                        {steps.map((_, i) => (
                            <div key={i} className={`dot ${i === step ? 'active' : ''}`} />
                        ))}
                    </div>
                    <button className="tutorial-next-btn" onClick={handleNext}>
                        {step === steps.length - 1 ? 'Get Started' : 'Next Step'}
                    </button>
                </div>
            </div>
        </div>
    )
}
