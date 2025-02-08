import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, get } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
    IndCustHomePage: undefined;
    IndCustLogPage: undefined;
    IndCustProfile: { custPrimaryKey: string };
};

type Props = NativeStackScreenProps<RootStackParamList, "IndCustLogPage">;

const IndCustLogPage: React.FC<Props> = ({ navigation }) => {
    const [nic, setNic] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const encodePassword = (password: string): string => {
        // Use the same encoding function as in registration
        const salt = "YourSecretSalt123"; // Must be the same salt as registration
        let encodedString = '';
        const textToEncode = password + salt;
        
        for (let i = 0; i < textToEncode.length; i++) {
            const charCode = textToEncode.charCodeAt(i);
            encodedString += charCode.toString(16);
        }
        
        return encodedString;
    };

    const handleLogin = async () => {
        if (!nic || !password) {
            setError("Please enter both NIC and password");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const customerRef = ref(rtdb, `CustomerRegistration/${nic}`);
            const snapshot = await get(customerRef);

            if (!snapshot.exists()) {
                setError("Invalid NIC or password");
                return;
            }

            const userData = snapshot.val();
            const encodedPassword = encodePassword(password);

            if (userData.password === encodedPassword) {
                // Login successful
                Alert.alert(
                    "Success",
                    "Login successful!",
                    [
                        {
                            text: "OK",
                            onPress: () => navigation.replace("IndCustProfile", { 
                                custPrimaryKey: nic 
                            })
                        }
                    ]
                );
            } else {
                setError("Invalid NIC or password");
            }
        } catch (error) {
            console.error("Login error:", error);
            setError("An error occurred while logging in");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Login to Your Account</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="NIC Number"
                        value={nic}
                        onChangeText={setNic}
                        style={styles.input}
                        placeholderTextColor="#888"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        style={styles.input}
                        placeholderTextColor="#888"
                        secureTextEntry
                    />
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Text style={styles.loginButtonText}>
                        {loading ? "Logging in..." : "Login"}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

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
    loginButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    loginButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default IndCustLogPage;