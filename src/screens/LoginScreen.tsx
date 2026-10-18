import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';

interface LoginScreenProps {
  onLogin?: (email: string, password: string) => Promise<void> | void;
  onGoToRegister?: () => void;
  isLoading?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLogin,
  onGoToRegister,
  isLoading = false,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng nhập đầy đủ Email và Mật khẩu');
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (onLogin) {
        await onLogin(email.trim(), password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng nhập không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  const loadingState = isLoading || submitting;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>⚔️ FOCUS COLOSSEUM</Text>
        <Text style={styles.title}>Đăng Nhập Đấu Trường</Text>
        <Text style={styles.subtitle}>Rèn luyện kỷ luật tập trung cùng đồng đội</Text>
      </View>

      <View style={styles.form}>
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email của bạn"
            placeholderTextColor="#6E7681"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Mật khẩu</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            placeholderTextColor="#6E7681"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loadingState && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loadingState}
        >
          {loadingState ? (
            <ActivityIndicator color="#0D1117" />
          ) : (
            <Text style={styles.submitButtonText}>Đăng nhập</Text>
          )}
        </TouchableOpacity>

        {onGoToRegister && (
          <TouchableOpacity style={styles.switchButton} onPress={onGoToRegister}>
            <Text style={styles.switchText}>
              Chưa có tài khoản chiến binh?{' '}
              <Text style={styles.switchHighlight}>Đăng ký ngay</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  badge: {
    color: '#D29922',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#F0F6FC',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#8B949E',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#161B22',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#30363D',
  },
  errorBox: {
    backgroundColor: 'rgba(218, 54, 51, 0.2)',
    borderColor: '#DA3633',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#F85149',
    fontSize: 13,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#C9D1D9',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#0D1117',
    borderColor: '#30363D',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#F0F6FC',
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: '#F778BA',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#0D1117',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  switchText: {
    color: '#8B949E',
    fontSize: 14,
  },
  switchHighlight: {
    color: '#58A6FF',
    fontWeight: '600',
  },
});
