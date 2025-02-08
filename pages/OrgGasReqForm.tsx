import React, { useState } from "react";
import { Text, TextInput, View, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { rtdb } from "../Services/firebase";
import { ref, set } from "firebase/database";

export default function OrgGasReqForm() {
    const [busiRegNo, setBusiRegNo] = useState("");
    const [orgName, setOrgName] = useState("");
    const [orgPhoneNumber, setOrgPhoneNumber] = useState("");
    const [email, setEmail] = useState("");
    const [outlet, setOutlet] = useState("");
    const [cylinderType, setCylinderType] = useState("3.2");
    const [cylinderCount, setCylinderCount] = useState("5");
    const [requestDate, setRequestDate] = useState("");
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [error, setError] = useState("");
    const [cylinderCountError, setCylinderCountError] = useState("");

    const cylinderTypes = ["3.2", "5", "12.5", "37.5"];

    // Keeping all the handler functions exactly the same
    const handleRequest = async () => {
        setError("");
        setCylinderCountError("");

        if (!busiRegNo || !orgName || !orgPhoneNumber || !email || !outlet || !cylinderType || !cylinderCount || !requestDate) {
            setError("Fill all the details");
            return;
        }

        if (parseInt(cylinderCount) < 5) {
            setCylinderCountError("Cylinder count must be 5 or more.");
            return;
        }

        try {
            await set(ref(rtdb, `OrgGasRequests/${busiRegNo}`), {
                busiRegNo,
                orgName,
                orgPhoneNumber,
                email,
                outlet,
                cylinderType: cylinderType + " kg",
                cylinderCount: parseInt(cylinderCount),
                requestDate,
                status: "pending",
            });

            Alert.alert("Success", "Requested gas cylinders successfully.");
            handleCancel();
        } catch (error) {
            console.error("Error submitting request: ", error);
            Alert.alert("Error", "Failed to submit the request. Try Again.");
        }
    };

    const handleCancel = () => {
        setBusiRegNo("");
        setOrgName("");
        setOrgPhoneNumber("");
        setEmail("");
        setOutlet("");
        setCylinderType("3.2");
        setCylinderCount("5");
        setRequestDate("");
        setError("");
        setCylinderCountError("");
    };

    const handleDateChange = (event: any, selectedDate?: Date | undefined) => {
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
                    <Text style={styles.label}>Business Registration No:</Text>
                    <TextInput
                        placeholder="Enter BR No"
                        value={busiRegNo}
                        onChangeText={setBusiRegNo}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Organization Name:</Text>
                    <TextInput
                        placeholder="Enter Organization Name"
                        value={orgName}
                        onChangeText={setOrgName}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Contact No:</Text>
                    <TextInput
                        placeholder="Enter Organization Contact No"
                        value={orgPhoneNumber}
                        onChangeText={setOrgPhoneNumber}
                        keyboardType="phone-pad"
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email:</Text>
                    <TextInput
                        placeholder="Enter Email Address"
                        value={email}
                        onChangeText={setEmail}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Outlet Name:</Text>
                    <TextInput
                        placeholder="Enter Outlet Name"
                        value={outlet}
                        onChangeText={setOutlet}
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Cylinder Type:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={cylinderType}
                            onValueChange={(itemValue) => setCylinderType(itemValue)}
                            style={styles.picker}
                        >
                            {cylinderTypes.map((type) => (
                                <Picker.Item key={type} label={`${type} kg`} value={type} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Cylinder Count:</Text>
                    <TextInput
                        placeholder="Enter Cylinder Count"
                        value={cylinderCount}
                        onChangeText={setCylinderCount}
                        keyboardType="numeric"
                        style={styles.input}
                        placeholderTextColor="#888"
                    />
                </View>

                {cylinderCountError && (
                    <Text style={styles.errorText}>{cylinderCountError}</Text>
                )}

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Request Date:</Text>
                    <View style={styles.dateContainer}>
                        <TextInput
                            placeholder="yyyy-mm-dd"
                            value={requestDate}
                            editable={false}
                            style={[styles.input, styles.dateInput]}
                            placeholderTextColor="#888"
                        />
                        <TouchableOpacity
                            style={styles.dateButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.dateButtonText}>Select Date</Text>
                        </TouchableOpacity>
                    </View>
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
        padding: 20,
    },
    formContainer: {
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
    label: {
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 5,
        color: "#333",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: "#fff",
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 5,
        backgroundColor: "#fff",
        overflow: "hidden",
    },
    picker: {
        height: 50,
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    dateInput: {
        flex: 1,
    },
    dateButton: {
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
        minWidth: 100,
    },
    dateButtonText: {
        color: "white",
        fontSize: 14,
        fontWeight: "bold",
        textAlign: "center",
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
        gap: 10,
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
    },
    cancelButtonText: {
        color: "#ff6600",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#ff6600",
        padding: 15,
        borderRadius: 5,
    },
    submitButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});