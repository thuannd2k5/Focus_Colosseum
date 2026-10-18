import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

interface RegisterScreenProps {
  onRegister?: (email: string, password: string, displayName: string) => Promise<void> | void;
  onGoToLogin?: () => void;
  isLoading?: boolean;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onRegister,
  onGoToLogin,
  isLoading = false,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!displayName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Vui lòng điền đầy đủ Tên hiển thị, Email và Mật khẩu');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Mật khẩu phải chứa ít nhất 6 ký tự');
      return;
    }
    setErrorMessage(null);
    setSubmitting(true);
    try {
      if (onRegister) {
        await onRegister(email.trim(), password, displayName.trim());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Đăng ký không thành công');
    } finally {
      setSubmitting(false);
    }
  };

  const loadingState = isLoading || submitting;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.badge}>🛡️ CHIẾN BINH MỚI</Text>
        <Text style={styles.title}>Gia Nhập Đấu Trường</Text>
        <Text style={styles.subtitle}>Tạo hồ sơ và tham gia cùng đội ngũ kỷ luật</Text>
      </View>

      <View style={styles.form}>
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên hiển thị chiến binh"
            placeholderTextColor="#6E7681"
            value={displayName}
            onChangeText={setDisplayName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập email"
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
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
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
            <Text style={styles.submitButtonText}>Đăng ký</Text>
          )}
        </TouchableOpacity>

        {onGoToLogin && (
          <TouchableOpacity style={styles.switchButton} onPress={onGoToLogin}>
            <Text style={styles.switchText}>
              Đã có tài khoản?{' '}
              <Text style={styles.switchHighlight}>Đăng nhập ngay</Text>
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
    color: '#3FB950',
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
    backgroundColor: '#2EA043',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
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
