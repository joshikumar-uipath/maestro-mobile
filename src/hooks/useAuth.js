"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.useAuth = exports.AuthProvider = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const core_1 = require("@uipath/uipath-typescript/core");
const AuthContext = (0, react_1.createContext)(undefined);
const AuthProvider = ({ children, config }) => {
    const [isAuthenticated, setIsAuthenticated] = (0, react_1.useState)(false);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [sdk, setSdk] = (0, react_1.useState)(() => new core_1.UiPath(config));
    (0, react_1.useEffect)(() => {
        const initializeAuth = async () => {
            setIsLoading(true);
            setError(null);
            try {
                if (sdk.isInOAuthCallback()) {
                    await sdk.completeOAuth();
                    // Clean up OAuth params from URL so a page refresh doesn't re-trigger the callback
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
                setIsAuthenticated(sdk.isAuthenticated());
            }
            catch (err) {
                console.error('Authentication initialization failed:', err);
                // Clear stale OAuth state from URL and storage so the user can retry cleanly
                window.history.replaceState({}, document.title, window.location.pathname);
                sessionStorage.removeItem(`uipath_sdk_user_token-${config.clientId}`);
                sessionStorage.removeItem('uipath_sdk_oauth_context');
                sessionStorage.removeItem('uipath_sdk_code_verifier');
                setError(err instanceof core_1.UiPathError ? err.message : 'Authentication failed');
                setIsAuthenticated(false);
            }
            finally {
                setIsLoading(false);
            }
        };
        initializeAuth();
    }, [sdk]);
    const login = async () => {
        setIsLoading(true);
        setError(null);
        try {
            await sdk.initialize();
            setIsAuthenticated(sdk.isAuthenticated());
        }
        catch (err) {
            console.error('Login failed:', err);
            setError(err instanceof core_1.UiPathError ? err.message : 'Login failed');
            setIsAuthenticated(false);
        }
        finally {
            setIsLoading(false);
        }
    };
    const logout = () => {
        sessionStorage.removeItem(`uipath_sdk_user_token-${config.clientId}`);
        sessionStorage.removeItem('uipath_sdk_oauth_context');
        sessionStorage.removeItem('uipath_sdk_code_verifier');
        setIsAuthenticated(false);
        setError(null);
        setSdk(new core_1.UiPath(config));
    };
    return ((0, jsx_runtime_1.jsx)(AuthContext.Provider, { value: { isAuthenticated, isLoading, sdk, login, logout, error }, children: children }));
};
exports.AuthProvider = AuthProvider;
const useAuth = () => {
    const context = (0, react_1.useContext)(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
exports.useAuth = useAuth;
//# sourceMappingURL=useAuth.js.map