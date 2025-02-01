import { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get, child } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
    OrgHomePage: undefined;
    OrgLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgLogPage">;

const OrgLogPage: React.FC<Props> = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');
        if (!email || !password) {
            setError('Enter your Email Address and Password');
            return;
        }
    
        try {
            const dbRef = ref(rtdb);
            const snapshot = await get(child(dbRef, "OrganizationRegistration"));
    
            if (snapshot.exists()) {
                let validLogin = false;
                let passwordMismatch = false;
    
                snapshot.forEach((childSnapshot) => {
                    const userData = childSnapshot.val();
                    if (userData.email === email) {
                        if (userData.password === password) {
                            validLogin = true;
                            Alert.alert("Success", "Logged in Successfully. Welcome back.");
                            console.log("User logged in:", userData);
                            navigation.navigate("OrgHomePage");
                            return;
                        } else {
                            passwordMismatch = true;
                        }
                    }
                });
    
                if (!validLogin) {
                    if (passwordMismatch) {
                        setError("Incorrect Password. Try again.");
                    } else {
                        setError("Invalid Email Address. Try Again or Please Register First.");
                    }
                }
            } else {
                setError("No users found in the database.");
            }
        } catch (error) {
            console.error("Error logging in:", error);
            Alert.alert("Error", "Something went wrong during login. Try again later.");
        }
    };    

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Organization Login</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleLogin}
                    >
                        <Text style={styles.submitButtonText}>Login</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity>
                    <Text style={styles.registerPrompt}>
                        Don't have an account? Create one now
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        justifyContent: "center",
        alignItems: "center",
    },
    formContainer: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ff6600",
        textAlign: "center",
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 15,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
    },
    errorText: {
        color: "red",
        textAlign: "center",
        marginBottom: 15,
    },
    buttonContainer: {
        marginTop: 15,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        width: "100%",
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    registerPrompt: {
        fontSize: 14,
        color: "#666",
        textAlign: "center",
        marginTop: 10,
    },
});

export default OrgLogPage;