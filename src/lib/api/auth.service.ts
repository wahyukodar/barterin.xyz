import api from '../utils/axios.util';
export const AuthService = {
	requestOtp: async (payload: unknown) => api.post('/auth/otp', payload),
	loginByOtp: async (payload: unknown) => api.post('/auth/login_by_otp', payload),
	checkToken: async () => api.get('/auth/check_token', {}),
	logoutByOTP: async () => api.post('/auth/logout_by_otp', {})
};
