
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert, FlatList, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { api } from '../api';

export default function ProcessBookScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { subjectId, subjectName } = route.params as any;
    const [uploading, setUploading] = useState(false);
    const [books, setBooks] = useState([]);

    useEffect(() => {
        loadBooks();
    }, []);

    const loadBooks = async () => {
        const data = await api.fetchBooks(subjectId);
        setBooks(data);
    };

    const pickDocument = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
            });

            if (result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setUploading(true);
                // Upload logic
                // Use FormData
                const formData = new FormData();
                formData.append('file', {
                    uri: file.uri,
                    name: file.name,
                    type: 'application/pdf'
                } as any);
                formData.append('subject_id', subjectId);

                try {
                    // Direct fetch due to FormData complexity in API wrapper sometimes
                    const response = await fetch('http://10.0.2.2:8000/upload_book', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });
                    const json = await response.json();
                    Alert.alert("Success", "Book uploaded and processing started!");
                    loadBooks();
                } catch (error) {
                    Alert.alert("Error", "Upload failed: " + error);
                } finally {
                    setUploading(false);
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Subject: {subjectName}</Text>

            <Button title="Upload New PDF Textbook" onPress={pickDocument} disabled={uploading} />

            {uploading && <ActivityIndicator size="large" color="#0000ff" />}

            <Text style={styles.subtitle}>Available Books:</Text>
            <FlatList
                data={books}
                keyExtractor={(item: any) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.item}
                        onPress={() => navigation.navigate('Chapters', { bookId: item.id, bookName: item.book_name })}
                    >
                        <Text style={styles.itemText}>{item.book_name}</Text>
                        <Text style={styles.status}>{item.processed ? "Ready" : "Processing..."}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
    title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
    subtitle: { fontSize: 18, marginTop: 20, marginBottom: 10 },
    item: { padding: 15, backgroundColor: 'white', marginBottom: 10, borderRadius: 8 },
    itemText: { fontSize: 16 },
    status: { fontSize: 12, color: 'gray', marginTop: 5 }
});
