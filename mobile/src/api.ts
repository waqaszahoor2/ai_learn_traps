
import Constants from "expo-constants";
import { Alert } from "react-native";

// Heuristic to determine API URL
// If running on simulator, localhost or 10.0.2.2 work.
// If running on physical device, we need the LAN IP.
// Expo exposes the host machine IP via hostUri in development.

const getApiUrl = () => {
    const debuggerHost = Constants.expoConfig?.hostUri;
    const localhost = "10.0.2.2";

    if (debuggerHost) {
        // debuggerHost is like "192.168.1.5:8081"
        const ip = debuggerHost.split(":")[0];
        return `http://${ip}:8000`; // Backend on port 8000
    }

    // Fallback for emulator if hostUri is missing (rare in managed)
    return `http://${localhost}:8000`;
};

const API_URL = getApiUrl();
console.log("API URL configured as:", API_URL);

export const api = {
    fetchClasses: async () => {
        try {
            const res = await fetch(`${API_URL}/classes`);
            if (!res.ok) throw new Error("Network response was not ok");
            return await res.json();
        } catch (error) {
            console.error("Fetch Classes Error:", error);
            Alert.alert("Connection Error", `Could not connect to backend at ${API_URL}. Ensure backend is running.`);
            return [];
        }
    },

    fetchSubjects: async (classId: string) => {
        try {
            const res = await fetch(`${API_URL}/subjects/${classId}`);
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    uploadBook: async (fileUri: string, fileName: string, fileType: string, subjectId: string) => {
        const formData = new FormData();
        formData.append("file", {
            uri: fileUri,
            name: fileName,
            type: fileType,
        } as any);
        formData.append("subject_id", subjectId);

        try {
            const res = await fetch(`${API_URL}/upload_book`, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            return await res.json();
        } catch (error) {
            console.error("Upload Error:", error);
            throw error;
        }
    },

    fetchBooks: async (subjectId: string) => {
        try {
            const res = await fetch(`${API_URL}/books/${subjectId}`);
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    fetchChapters: async (bookId: string) => {
        try {
            const res = await fetch(`${API_URL}/chapters/${bookId}`);
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    },

    fetchQuestions: async (chapterId: string) => {
        try {
            const res = await fetch(`${API_URL}/questions/${chapterId}`);
            return await res.json();
        } catch (error) {
            console.error(error);
            return [];
        }
    }
};
