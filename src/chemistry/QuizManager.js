class QuizManager {
    constructor() {
        this.quizQuestionBank = [
            {
                id: 1,
                chapter: "Chemical Reactions and Equations",
                question: "Which gas is evolved when dilute hydrochloric acid is added to reactive metals like zinc?",
                options: ["Hydrogen gas", "Oxygen gas", "Chlorine gas", "Carbon dioxide gas"],
                correctAnswer: 0
            },
            {
                id: 2,
                chapter: "Chemical Reactions and Equations",
                question: "What type of chemical reaction is the rusting of iron?",
                options: ["Decomposition reaction", "Oxidation reaction", "Displacement reaction", "Endothermic reaction"],
                correctAnswer: 1
            },
            {
                id: 3,
                chapter: "Acids, Bases and Salts",
                question: "What is the chemical formula of Baking Soda?",
                options: ["Na2CO3", "NaHCO3", "CaOCl2", "CaSO4.1/2H2O"],
                correctAnswer: 1
            },
            {
                id: 4,
                chapter: "Acids, Bases and Salts",
                question: "What color does blue litmus paper turn when dipped in an acid?",
                options: ["Red", "Green", "Yellow", "No change"],
                correctAnswer: 0
            },
            {
                id: 5,
                chapter: "Metals and Non-metals",
                question: "Which metal exists in liquid state at room temperature?",
                options: ["Sodium", "Mercury", "Potassium", "Aluminum"],
                correctAnswer: 1
            },
            {
                id: 6,
                chapter: "Metals and Non-metals",
                question: "Which of the following non-metals is a good conductor of electricity?",
                options: ["Sulphur", "Graphite", "Oxygen", "Nitrogen"],
                correctAnswer: 1
            }
        ];
    }

    getAllQuestions() {
        return this.quizQuestionBank;
    }

    getRandomQuestions(numberOfQuestions = 5) {
        const shuffled = [...this.quizQuestionBank].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, Math.min(numberOfQuestions, this.quizQuestionBank.length));
    }
}
