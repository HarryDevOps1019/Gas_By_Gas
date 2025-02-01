import React, { useState } from "react";
import { Button, Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, set } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  IndCustHomePage: undefined;
  IndCustLogPage: undefined;
  IndCustRegForm: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "IndCustRegForm">;

const IndCustRegForm: React.FC<Props> = ({ navigation }) => {
    const [nic, setNic] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const validatePassword = (password: string): boolean => {
        // Minimum 8 characters
        return password.length >= 8;
    };

    const encodePassword = (password: string): string => {
        // Simple password encoding using built-in functions
        const salt = "YourSecretSalt123"; // Store this in your environment config
        let encodedString = '';
        const textToEncode = password + salt;
        
        // Basic encoding algorithm
        for (let i = 0; i < textToEncode.length; i++) {
            const charCode = textToEncode.charCodeAt(i);
            encodedString += charCode.toString(16); // Convert to hex
        }
        
        return encodedString;
    };

    const handleAddDetails = async () => {
        setError("");

        if (!nic || !name || !phoneNumber || !email || !password) {
            setError("Please fill all the details");
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError("Please enter a valid email address");
            return;
        }

        // Validate password length
        if (!validatePassword(password)) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            // Encode the password
            const encodedPassword = encodePassword(password);
            
            const customerRef = ref(rtdb, `CustomerRegistration/${nic}`);

            await set(customerRef, {
                nic,
                name,
                phoneNumber,
                email,
                password: encodedPassword, // Store the encoded password
            });

            Alert.alert("Register Successful", "Registered your details successfully.", [
                { text: "OK", onPress: () => navigation.replace("IndCustHomePage") },
            ]);
            console.log("Data registered successfully");

            handleCancel();
        } catch (error) {
            console.error("Error adding details: ", error);
            Alert.alert("Error", "Failed to register the details. Try Again.");
        }
    };

    const handleCancel = () => {
        setNic("");
        setName("");
        setPhoneNumber("");
        setEmail("");
        setPassword("");
        setError("");
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Create Your Account</Text>
                
                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="NIC Number"
                        value={nic}
                        onChangeText={setNic}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Email Address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor="#888"
                        keyboardType="email-address"
                        autoCapitalize="none"
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

                <TouchableOpacity 
                    style={styles.registerButton} 
                    onPress={handleAddDetails}
                >
                    <Text style={styles.registerButtonText}>Register</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.cancelButton} 
                    onPress={handleCancel}
                >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
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
        color: "#ff6600", // AliExpress orange
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
    registerButton: {
        backgroundColor: "#ff6600", // AliExpress orange
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
        marginBottom: 10,
    },
    registerButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    cancelButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#ff6600",
        fontSize: 18,
        fontWeight: "bold",
    },
});

export default IndCustRegForm;