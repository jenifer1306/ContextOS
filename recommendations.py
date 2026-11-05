"""
ContextOS - Recommendation Engine (Simplified)
Generates 2-3 clear, beginner-friendly contextual suggestions based on the active context:
Study, Research, or Document Editing.
"""
from typing import List, Dict, Any

class RecommendationEngine:
    """
    Computes situational recommendations with clear, simple explanations
    based on the current selected context.
    """

    def generate_recommendations(self, context: Dict[str, Any]) -> List[Dict[str, Any]]:
        category = context.get("category", "Study")

        if category == "Study":
            return [
                {
                    "id": "rec_study_1",
                    "title": "Review Scheduling Algorithms",
                    "description": "Ask the AI assistant to explain Round Robin and Shortest Job First with a simple example.",
                    "rationale": "Directly related to your active Operating Systems study topic.",
                    "category": "Study",
                    "action_payload": {
                        "prompt": "Explain Round Robin and Shortest Job First CPU scheduling algorithms with simple real-life analogies."
                    },
                },
                {
                    "id": "rec_study_2",
                    "title": "Generate Practice Quiz",
                    "description": "Test your knowledge with 3 quick practice questions on CPU scheduling.",
                    "rationale": "Helps check your conceptual understanding before exams.",
                    "category": "Study",
                    "action_payload": {
                        "prompt": "Create 3 beginner-friendly practice questions on CPU process scheduling, with brief explanations."
                    },
                },
            ]

        elif category == "Research":
            return [
                {
                    "id": "rec_research_1",
                    "title": "Summarize Research Key Points",
                    "description": "Ask the AI assistant to summarize the core advantages and challenges of on-device context systems.",
                    "rationale": "Helpful for your literature review on context-aware computing.",
                    "category": "Research",
                    "action_payload": {
                        "prompt": "What are the primary benefits and challenges of running Small Language Models locally on a PC instead of in the cloud?"
                    },
                },
                {
                    "id": "rec_research_2",
                    "title": "Compare Cloud vs Local AI",
                    "description": "Create a clear comparison table between cloud AI and local SLM inference.",
                    "rationale": "Useful for explaining your project's privacy motivation during viva examination.",
                    "category": "Research",
                    "action_payload": {
                        "prompt": "Compare Cloud AI assistants and On-Device SLMs across privacy, latency, internet dependency, and hardware requirements in a simple table."
                    },
                },
            ]

        elif category in ("Document Editing", "Documents"):
            return [
                {
                    "id": "rec_doc_1",
                    "title": "Review Report Structure",
                    "description": "Check if your project report has all required sections: Abstract, Design, Implementation, and Evaluation.",
                    "rationale": "Useful while authoring your final university project report.",
                    "category": "Document Editing",
                    "action_payload": {
                        "prompt": "Provide a standard university project report outline for a computer science software project."
                    },
                },
                {
                    "id": "rec_doc_2",
                    "title": "Draft Architecture Summary",
                    "description": "Generate a concise, clear paragraph explaining ContextOS's simple layered design.",
                    "rationale": "Helps you describe the architecture clearly for your project documentation.",
                    "category": "Document Editing",
                    "action_payload": {
                        "prompt": "Write a clear, non-technical paragraph explaining the ContextOS architecture: frontend, backend, SQLite, and local Ollama SLM."
                    },
                },
            ]

        else:
            return [
                {
                    "id": "rec_gen_1",
                    "title": "Select a Context Preset",
                    "description": "Switch between Study, Research, or Document Editing above to see contextual assistance.",
                    "rationale": "Helps you explore how context changes AI responses.",
                    "category": "General",
                    "action_payload": {
                        "prompt": "Explain what ContextOS is and how selecting different contexts changes your assistance."
                    },
                },
            ]

# Singleton Recommendation Engine
recommendation_engine = RecommendationEngine()
