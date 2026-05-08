import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangle, CheckCircle, Star, ArrowLeft } from 'lucide-react-native';
import { API } from '../api';

export default function ExamGeneratorScreen() {
    const { colors } = useTheme();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { chapterId, chapterName } = route.params || {};

    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (chapterId) {
            generateQuestions();
        }
    }, [chapterId]);

    const generateQuestions = async () => {
        try {
            const data = await API.generateExam(chapterId);
            setQuestions(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const renderQuestion = ({ item, index }: { item: any, index: number }) => (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
                <Text style={[styles.qNum, { color: colors.textSecondary }]}>Q{index + 1}</Text>

                {item.is_most_important && (
                    <View style={styles.badge}>
                        <Star size={12} color="#fff" fill="#fff" />
                        <Text style={styles.badgeText}>Most Important</Text>
                    </View>
                )}

                <View style={[styles.probBadge, { backgroundColor: item.exam_probability_score > 0.8 ? colors.error : colors.warning }]}>
                    <Text style={styles.probText}>{(item.exam_probability_score * 100).toFixed(0)}% Likely</Text>
                </View>
            </View>

            <Text style={[styles.questionText, { color: colors.text }]}>{item.question_text}</Text>

            {/* Options for MCQ */}
            {item.options && item.options.length > 0 ? (
                <View style={styles.optionsContainer}>
                    {item.options.map((opt: string, i: number) => (
                        <View key={i} style={[styles.optionRow, { borderColor: colors.border }]}>
                            <Text style={[styles.optionText, { color: colors.text }]}>{opt}</Text>
                        </View>
                    ))}
                </View>
            ) : null}

            <View style={[styles.answerBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                <Text style={[styles.answerLabel, { color: colors.success }]}>Correct Answer:</Text>
                <Text style={[styles.answerText, { color: colors.text }]}>{item.correct_answer}</Text>
            </View>

            <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Difficulty: {item.difficulty_level}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <ArrowLeft size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={[styles.superTitle, { color: colors.textSecondary }]}>{chapterName}</Text>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>Exam Questions</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analyzing Textbook Patterns...</Text>
                    <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Predicting Board Exam Questions...</Text>
                </View>
            ) : (
                <FlatList
                    data={questions}
                    renderItem={renderQuestion}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No questions generated.</Text>
                    }
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginRight: 16,
    },
    superTitle: {
        fontSize: 14,
        marginBottom: 4,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    qNum: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    badge: {
        backgroundColor: '#EAB308',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
        marginLeft: 4,
    },
    probBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    probText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 10,
    },
    questionText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        lineHeight: 26,
    },
    optionsContainer: {
        marginBottom: 16,
    },
    optionRow: {
        padding: 12,
        borderWidth: 1,
        borderRadius: 12,
        marginBottom: 8,
    },
    optionText: {
        fontSize: 16,
    },
    answerBox: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },
    answerLabel: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    answerText: {
        fontSize: 16,
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    metaText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
    }
});
