import React from "react";
import { StyleSheet, View } from "react-native";
import StepOne from "./steps/step-one";
import StepTwo from "./steps/step-two";
import { router } from "expo-router";

export default function Welcome() {
  const [step, setStep] = React.useState(1);

  const handleNextStep = () => {
    if (step === 2) {
      router.replace("/list");
      return;
    }
    setStep(step + 1);
  };

  const HandleSteps = () => {
    switch (step) {
      case 1:
        return <StepOne handleNextStep={handleNextStep} />;
      case 2:
        return <StepTwo handleNextStep={handleNextStep} />;
      default:
        return <StepOne handleNextStep={handleNextStep} />;
    }
  };

  return <View style={styles.container}>{HandleSteps()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
});
