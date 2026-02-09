export interface ModuleConfig {
    key: string;
    name: string;
    displayName: string;
    color: string;
    icon: string;
    enabled?: boolean;
    order?: number;
}

// Fallback configuration (used if API fails)
export const FALLBACK_MODULE_CONFIG: Record<string, ModuleConfig> = {
    aml: {
        key: 'aml',
        name: 'AML',
        displayName: 'AML Detections',
        color: '#8b5cf6',
        icon: '💰'
    },
    credit: {
        key: 'credit',
        name: 'Credit',
        displayName: 'Credit Risk',
        color: '#3b82f6',
        icon: '📊'
    },
    insurance: {
        key: 'insurance',
        name: 'Insurance',
        displayName: 'Insurance Fraud',
        color: '#10b981',
        icon: '🛡️'
    },
    market: {
        key: 'market',
        name: 'Market',
        displayName: 'Market Manipulation',
        color: '#f59e0b',
        icon: '📈'
    }
};

// Global state for modules (fetched from API)
let cachedModules: ModuleConfig[] | null = null;

// Helper to get modules with data
export const getActiveModules = (data: Record<string, number>, modules: ModuleConfig[]): ModuleConfig[] => {
    return modules.filter(module => data[module.key] !== undefined && data[module.key] > 0);
};

// Helper to get all configured modules (from cache or fallback)
export const getAllModules = (): ModuleConfig[] => {
    if (cachedModules) {
        return cachedModules;
    }
    return Object.values(FALLBACK_MODULE_CONFIG);
};

// Fetch modules from backend and cache
export const fetchModules = async (): Promise<ModuleConfig[]> => {
    try {
        const { modulesAPI } = await import('../api');
        const response = await modulesAPI.getModules();
        cachedModules = response.modules || [];
        return cachedModules;
    } catch (error) {
        console.warn('Failed to fetch modules from API, using fallback:', error);
        cachedModules = Object.values(FALLBACK_MODULE_CONFIG);
        return cachedModules;
    }
};

// Convert modules array to Record for easy lookup
export const modulesToRecord = (modules: ModuleConfig[]): Record<string, ModuleConfig> => {
    return modules.reduce((acc, module) => {
        acc[module.key] = module;
        return acc;
    }, {} as Record<string, ModuleConfig>);
};
