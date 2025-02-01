import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { rtdb } from "../Services/firebase";
import { ref, set } from "firebase/database";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

type RootStackParamList = {
  IndCustHomePage: undefined;
  OrgRegForm: undefined;
  OrgLogPage: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "OrgRegForm">;

const OrgRegForm: React.FC<Props> = ({ navigation }) => {
    const [busiRegNo, setBusiRegNo] = useState("");
    const [orgName, setOrgName] = useState("");
    const [orgPhoneNumber, setOrgPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [address, setAddress] = useState("");
    const [error, setError] = useState("");

    const handleAddDetails = async () => {
        setError("");
        if (!busiRegNo || !orgName || !orgPhoneNumber || !email || !password || !address) {
            setError("Fill all the details");
            return;
        }

        try {
            const orgRef = ref(rtdb, `OrganizationRegistration/${busiRegNo}`);
            await set(orgRef, {
                busiRegNo,
                orgName,
                orgPhoneNumber,
                email,
                password,
                address,
            });

            Alert.alert("Success", "Registered the details successfully.");
            handleCancel();
        } catch (error) {
            if (error instanceof Error) {
                console.error("Error adding details: ", error.message);
                console.error("Full error payload: ", error);
            } else {
                console.error("An unexpected error occurred: ", error);
            }
            throw new Error("Failed to register the details. Try Again.");
        }
    };

    const handleCancel = () => {
        setBusiRegNo("");
        setOrgName("");
        setOrgPhoneNumber("");
        setEmail("");
        setPassword("");
        setAddress("");
        setError("");
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Organization Registration Form</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Business Registration Number"
                        value={busiRegNo}
                        onChangeText={setBusiRegNo}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Organization Name"
                        value={orgName}
                        onChangeText={setOrgName}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Organization Contact Number"
                        value={orgPhoneNumber}
                        onChangeText={setOrgPhoneNumber}
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

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Organization Address"
                        value={address}
                        onChangeText={setAddress}
                        style={styles.input}
                        placeholderTextColor="#888"
                        multiline
                    />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={styles.cancelButton} 
                        onPress={handleCancel}
                    >
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={styles.submitButton} 
                        onPress={handleAddDetails}
                    >
                        <Text style={styles.submitButtonText}>Register</Text>
                    </TouchableOpacity>
                </View>
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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    cancelButton: {
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        flex: 1,
        marginRight: 10,
    },
    cancelButtonText: {
        color: "#ff6600",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    submitButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        flex: 1,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default OrgRegForm;