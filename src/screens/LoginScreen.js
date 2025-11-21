import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/Feather';
import { loginUser } from '../redux/authSlice';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../utils/constants';

const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Username must be at least 3 characters')
    .required('Username is required'),
  password: Yup.string()
    .min(4, 'Password must be at least 4 characters')
    .required('Password is required'),
});

const LoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values) => {
    try {
      await dispatch(loginUser(values));
    } catch (error) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Please check your credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Icon name="activity" size={50} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Welcome to SportyX</Text>
          <Text style={styles.subtitle}>
            Login to explore your favorite teams
          </Text>
        </View>

        {/* Form */}
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}>
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
          }) => (
            <View style={styles.form}>
              <CustomInput
                label="Username"
                icon="user"
                placeholder="Enter your username"
                value={values.username}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                error={errors.username}
                touched={touched.username}
                autoCapitalize="none"
              />

              <View style={styles.passwordContainer}>
                <CustomInput
                  label="Password"
                  icon="lock"
                  placeholder="Enter your password"
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={errors.password}
                  touched={touched.password}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={COLORS.textLight}
                  />
                </TouchableOpacity>
              </View>

              {error && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={16} color={COLORS.error} />
                  <Text style={styles.errorMessage}>{error}</Text>
                </View>
              )}

              <CustomButton
                title="Login"
                onPress={handleSubmit}
                loading={loading}
                style={styles.loginButton}
              />

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('Signup')}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Demo Credentials */}
              <View style={styles.demoContainer}>
                <Text style={styles.demoTitle}>Demo Credentials:</Text>
                <Text style={styles.demoText}>Username: admin</Text>
                <Text style={styles.demoText}>Password: admin</Text>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl * 2,
    marginBottom: SPACING.xl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    elevation: 4,
    shadowColor: COLORS.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  form: {
    marginTop: SPACING.lg,
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeIcon: {
    position: 'absolute',
    right: SPACING.md,
    top: 38,
    padding: SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fee',
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  errorMessage: {
    color: COLORS.error,
    fontSize: FONT_SIZES.sm,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  loginButton: {
    marginTop: SPACING.md,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  signupText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
  },
  signupLink: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  demoContainer: {
    marginTop: SPACING.xl,
    padding: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  demoTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: FONT_WEIGHTS.semibold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  demoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
});

export default LoginScreen;
