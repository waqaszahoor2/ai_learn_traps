
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { api } from "../api";

export default function ChaptersScreen() {
    const route = useRoute();
    const navigation = useNavigation();
    const { bookId, bookName } = route.params as any;
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadChapters = async () => {
            try {
                const data = await api.fetchChapters(bookId);
                setChapters(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadChapters();
    }, [bookId]);

    if (loading) return <ActivityIndicator />

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{bookName} - Chapters</Text>

            <FlatList
                data={chapters}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.card}
                        onPress={() => navigation.navigate("Exam", { chapterId: item.id, chapterName: item.chapter_name })}
                    >
                        <Text style={styles.cardTitle}>{item.chapter_name}</Text>
                        <Text style={styles.pages}>{item.page_start} - {item.page_end}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f0f0f0' },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
    card: { backgroundColor: "white", padding: 16, marginBottom: 12, borderRadius: 8, elevation: 2 },
    cardTitle: { fontSize: 18, fontWeight: "600" },
    pages: { color: "gray", marginTop: 4 }
});
