import { useEffect } from "react";

interface BiometricVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
  subtitle?: string;
  moduleName?: string;
  userEmail?: string;
  verificationType?: "fingerprint" | "face";
}

export const BiometricVerificationModal = ({
  isOpen,
  onClose,
  onSuccess,
}: BiometricVerificationModalProps) => {
  useEffect(() => {
    if (isOpen) {
      onSuccess();
      onClose();
    }
  }, [isOpen, onClose, onSuccess]);

  return null;
};

export default BiometricVerificationModal;
