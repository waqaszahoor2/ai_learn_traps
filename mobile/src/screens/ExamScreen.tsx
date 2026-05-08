
import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Button, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { api } from "../api";

export default function ExamScreen() {
    const route = useRoute();
    const { chapterId, chapterName } = route.params as any;
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visibleExplanations, setVisibleExplanations] = useState({});

    useEffect(() => {
        loadQuestions();
    }, [chapterId]);

    const loadQuestions = async () => {
        try {
            const data = await api.fetchQuestions(chapterId);
            setQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExplanation = (questionId: string) => {
        setVisibleExplanations(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }));
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

    if (questions.length === 0) return (
        <View style={styles.center}>
            <Text style={styles.empty}>No questions generated for this chapter yet.</Text>
            <Button title="Refresh" onPress={loadQuestions} />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>{chapterName} Exam</Text>

            {questions.map((q: any, index: number) => (
                <View key={q.id} style={styles.questionCard}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{q.question_type}</Text>
                    </View>
                    <Text style={styles.questionText}>
                        <Text style={styles.qIndex}>Q{index + 1}. </Text>
                        {q.question_text}
                    </Text>

                    {q.options && q.options.length > 0 && (
                        <View style={styles.optionsContainer}>
                            {q.options.map((opt, i) => (
                                <View key={i} style={styles.option}>
                                    <Text style={styles.optionText}>• {opt}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <TouchableOpacity
                        style={styles.toggleBtn}
                        onPress={() => toggleExplanation(q.id)}
                    >
                        <Text style={styles.toggleText}>
                            {visibleExplanations[q.id] ? "Hide Answer & Explanation" : "Show Answer"}
                        </Text>
                    </TouchableOpacity>

                    {visibleExplanations[q.id] && (
                        <View style={styles.explanationBox}>
                            <Text style={styles.correctAnswer}>
                                Correct Answer: <Text style={styles.bold}>{q.correct_answer}</Text>
                            </Text>
                            <Text style={styles.explanation}>
                                Reason: {q.explanation}
                            </Text>
                            {q.reference_page && (
                                <Text style={styles.ref}>Ref: Page {q.reference_page}</Text>
                            )}
                        </View>
                    )}
                </View>
            ))}

            <View style={styles.footer} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f7fa", padding: 15 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    header: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
    empty: { fontSize: 16, marginBottom: 20 },

    questionCard: {
        backgroundColor: "white",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3
    },
    badge: {
        backgroundColor: "#e3f2fd",
        alignSelf: "flex-start",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        marginBottom: 8
    },
    badgeText: { color: "#1e88e5", fontSize: 12, fontWeight: "bold" },
    questionText: { fontSize: 16, lineHeight: 24, color: "#333", marginBottom: 12 },
    qIndex: { fontWeight: "bold" },

    optionsContainer: { marginBottom: 12, paddingLeft: 10 },
    option: { marginBottom: 8 },
    optionText: { fontSize: 15, color: "#555" },

    toggleBtn: {
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        marginTop: 5
    },
    toggleText: { color: "#2196f3", fontWeight: "600", textAlign: "center" },

    explanationBox: {
        backgroundColor: "#f9fbe7",
        padding: 12,
        borderRadius: 8,
        marginTop: 10
    },
    correctAnswer: { fontSize: 15, color: "#2e7d32", marginBottom: 6 },
    bold: { fontWeight: "bold" },
    explanation: { fontSize: 14, color: "#558b2f", lineHeight: 20 },
    ref: { fontSize: 12, color: "#827717", marginTop: 8, fontStyle: "italic" },

    footer: { height: 40 }
});
