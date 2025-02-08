import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { rtdb } from "../Services/firebase";
import { ref, set } from "firebase/database";

export default function IndCustGasReqForm() {
    const [nic, setNic] = useState("");
    const [name, setName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [outlet, setOutlet] = useState("");
    const [cylinderType, setCylinderType] = useState("2.3");
    const [cylinderCount, setCylinderCount] = useState("1");
    const [requestDate, setRequestDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState("");

    const cylinderTypes = ["3.2", "5", "12.5"];
    const cylinderCounts = ["1", "2", "3"];

    const handleRequest = async () => {
        setError("");

        if (!nic || !name || !phoneNumber || !email || !outlet || !cylinderType || !cylinderCount || !requestDate) {
            setError("Fill all the details");
            return;
        }

        try {
            await set(ref(rtdb, `IndCustGasRequests/${nic}`), {
                nic,
                name,
                phoneNumber,
                email,
                outlet,
                cylinderType: cylinderType + " kg",
                cylinderCount: parseInt(cylinderCount),
                requestDate,
                status: "pending",
            });

            Alert.alert("Success", "Requested gas cylinders successfully.");
            handleCancel();
        }
        
        catch (error) {
            console.error("Error submitting request: ", error);
            Alert.alert("Error", "Failed to submit the request. Try Again.");
        }
    };

    const handleCancel = () => {
        setNic("");
        setName("");
        setPhoneNumber("");
        setEmail("");
        setOutlet("");
        setCylinderType("3.2");
        setCylinderCount("1");
        setRequestDate("");
        setError("");
    };

    const handleDateChange = (
        event: any,
        selectedDate?: Date | undefined
    ) => {
        setShowDatePicker(false);

        if (selectedDate) {
            const formattedDate = selectedDate.toISOString().split("T")[0];
            setRequestDate(formattedDate);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Text style={styles.title}>Cylinder Request Form</Text>

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
                    />
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        placeholder="Outlet Name"
                        value={outlet}
                        onChangeText={setOutlet}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Cylinder Type (kg)</Text>
                    <Picker
                        selectedValue={cylinderType}
                        onValueChange={(itemValue) => setCylinderType(itemValue)}
                        style={styles.picker}
                    >
                        {cylinderTypes.map((type) => (
                            <Picker.Item key={type} label={type} value={type} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.pickerContainer}>
                    <Text style={styles.pickerLabel}>Cylinder Count</Text>
                    <Picker
                        selectedValue={cylinderCount}
                        onValueChange={(itemValue) => setCylinderCount(itemValue)}
                        style={styles.picker}
                    >
                        {cylinderCounts.map((count) => (
                            <Picker.Item key={count} label={count} value={count} />
                        ))}
                    </Picker>
                </View>

                <View style={styles.inputContainer}>
                    <TouchableOpacity 
                        style={styles.datePicker}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={styles.datePickerText}>
                            {requestDate ? requestDate : "Select Request Date"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={requestDate ? new Date(requestDate) : new Date()}
                        mode="date"
                        display="default"
                        onChange={handleDateChange}
                    />
                )}

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
                        onPress={handleRequest}
                    >
                        <Text style={styles.submitButtonText}>Request</Text>
                    </TouchableOpacity>
                </View>
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
    pickerContainer: {
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
    },
    pickerLabel: {
        fontSize: 16,
        color: "#ff6600",
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    picker: {
        width: "100%",
    },
    datePicker: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
    },
    datePickerText: {
        fontSize: 16,
        color: "#888",
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