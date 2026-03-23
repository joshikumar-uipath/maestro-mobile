import React from 'react';
import type { ReactNode } from 'react';
import { UiPath } from '@uipath/uipath-typescript/core';
import type { UiPathSDKConfig } from '@uipath/uipath-typescript/core';
interface AuthContextType {
    isAuthenticated: boolean;
    isLoading: boolean;
    sdk: UiPath;
    login: () => Promise<void>;
    logout: () => void;
    error: string | null;
}
export declare const AuthProvider: React.FC<{
    children: ReactNode;
    config: UiPathSDKConfig;
}>;
export declare const useAuth: () => AuthContextType;
export {};
//# sourceMappingURL=useAuth.d.ts.map