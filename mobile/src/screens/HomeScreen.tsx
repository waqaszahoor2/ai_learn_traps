
import React, { useState, useEffect } from "react";
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api } from "../api";

export default function HomeScreen() {
    const navigation = useNavigation();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedClassId, setSelectedClassId] = useState(null);
    const [subjects, setSubjects] = useState([]);

    const loadClasses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.fetchClasses();
            if (Array.isArray(data) && data.length > 0) {
                setClasses(data);
            } else {
                setError("No classes found. Ensure backend is running and seeded.");
            }
        } catch (err) {
            setError("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClasses();
    }, []);

    const onSelectClass = async (classId: string) => {
        setSelectedClassId(classId);
        try {
            const data = await api.fetchSubjects(classId);
            setSubjects(data);
        } catch (e) {
            Alert.alert("Error", "Failed to fetch subjects");
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#BF40BF" />
                <Text>Connecting to backend...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error}</Text>
                <Button title="Retry Connection" onPress={loadClasses} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>AI Exam Generator</Text>

            <Text style={styles.sectionHeader}>Select Class:</Text>
            <FlatList
                horizontal
                data={classes}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingVertical: 10 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.chip, selectedClassId === item.id && styles.chipSelected]}
                        onPress={() => onSelectClass(item.id)}
                    >
                        <Text style={[styles.chipText, selectedClassId === item.id && styles.chipTextSelected]}>
                            {item.class_name}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {subjects.length > 0 && (
                <>
                    <Text style={styles.sectionHeader}>Select Subject:</Text>
                    <FlatList
                        data={subjects}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.subjectCard}
                                onPress={() => navigation.navigate("ProcessBook", { subjectId: item.id, subjectName: item.subject_name })}
                            >
                                <Text style={styles.subjectText}>{item.subject_name}</Text>
                                <Text style={styles.subText}>Tap to upload or view textbooks</Text>
                            </TouchableOpacity>
                        )}
                    />
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff", paddingTop: 50 },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 28, fontWeight: "bold", textAlign: "center", marginBottom: 30, color: "#BF40BF" },
    sectionHeader: { fontSize: 18, marginBottom: 10, fontWeight: "600", marginTop: 10 },
    chip: {
        paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "#f0f0f0", borderRadius: 25, marginRight: 10, height: 45, justifyContent: 'center'
    },
    chipSelected: { backgroundColor: "#BF40BF" },
    chipText: { color: "#333", fontSize: 16 },
    chipTextSelected: { color: "white", fontWeight: "bold" },
    subjectCard: {
        padding: 20, backgroundColor: "#f8f9fa", marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: "#e0e0e0",
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
    },
    subjectText: { fontSize: 18, fontWeight: "bold", color: "#333" },
    subText: { color: "#666", marginTop: 5, fontSize: 14 },
    errorText: { color: "red", marginBottom: 20, textAlign: "center" }
});
