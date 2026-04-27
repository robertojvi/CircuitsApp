/**
 * Design System Utilities
 * Centralized color, spacing, and style constants
 */

export const colors = {
    primary: '#3498db',
    primaryHover: '#2980b9',
    primaryLight: '#5dade2',
    darkBg: '#2c3e50',
    darkBgSecondary: '#34495e',
    darkBgTertiary: '#1a252f',
    surface: '#ecf0f1',
    surfaceLight: '#f8f9fa',
    textDark: '#2c3e50',
    textLight: '#ecf0f1',
    textMuted: '#95a5a6',
    border: '#4b6584',
    borderLight: '#bdc3c7',
    success: '#27ae60',
    successLight: '#d5f4e6',
    error: '#e74c3c',
    errorLight: '#fadbd8',
    warning: '#f39c12',
    warningLight: '#fdebd0',
    info: '#3498db',
    infoLight: '#d6eaf8',
};

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xl2: '24px',
    xl3: '32px',
};

export const typography = {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xl2: '24px',
    xl3: '32px',
};

export const radius = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
};

export const shadows = {
    sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
    md: '0 4px 12px rgba(0, 0, 0, 0.12)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.15)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.18)',
};

export const transitions = {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
};

// Common button styles
export const buttonStyles = {
    primary: {
        backgroundColor: colors.primary,
        color: 'white',
        padding: `${spacing.sm} ${spacing.lg}`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.base,
        fontWeight: '500',
        cursor: 'pointer',
        transition: `all ${transitions.base}`,
        boxShadow: shadows.sm,
    },
    secondary: {
        backgroundColor: colors.textMuted,
        color: 'white',
        padding: `${spacing.sm} ${spacing.lg}`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.base,
        fontWeight: '500',
        cursor: 'pointer',
        transition: `all ${transitions.base}`,
        boxShadow: shadows.sm,
    },
    danger: {
        backgroundColor: colors.error,
        color: 'white',
        padding: `${spacing.sm} ${spacing.lg}`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.base,
        fontWeight: '500',
        cursor: 'pointer',
        transition: `all ${transitions.base}`,
        boxShadow: shadows.sm,
    },
    success: {
        backgroundColor: colors.success,
        color: 'white',
        padding: `${spacing.sm} ${spacing.lg}`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.base,
        fontWeight: '500',
        cursor: 'pointer',
        transition: `all ${transitions.base}`,
        boxShadow: shadows.sm,
    },
    warning: {
        backgroundColor: colors.warning,
        color: 'white',
        padding: `${spacing.sm} ${spacing.lg}`,
        border: 'none',
        borderRadius: radius.md,
        fontSize: typography.base,
        fontWeight: '500',
        cursor: 'pointer',
        transition: `all ${transitions.base}`,
        boxShadow: shadows.sm,
    },
};

// Common input styles
export const inputStyles = {
    standard: {
        width: '100%',
        padding: `${spacing.md} ${spacing.lg}`,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: radius.md,
        fontSize: typography.base,
        fontFamily: 'inherit',
        transition: `all ${transitions.fast}`,
        boxSizing: 'border-box',
        backgroundColor: colors.surfaceLight,
        color: colors.textDark,
    },
};

// Common card styles
export const cardStyles = {
    standard: {
        backgroundColor: 'white',
        borderRadius: radius.lg,
        padding: spacing.xl,
        boxShadow: shadows.sm,
        border: `1px solid ${colors.borderLight}`,
        transition: `box-shadow ${transitions.base}`,
    },
    dark: {
        backgroundColor: colors.darkBgSecondary,
        color: colors.textLight,
        borderColor: colors.border,
        borderRadius: radius.lg,
        padding: spacing.xl,
        boxShadow: shadows.sm,
        border: `1px solid ${colors.border}`,
        transition: `box-shadow ${transitions.base}`,
    },
};

// Common modal styles
export const modalStyles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
        zIndex: 1200,
    },
    content: {
        backgroundColor: 'white',
        borderRadius: radius.xl,
        boxShadow: shadows.xl,
        maxHeight: '90vh',
        overflowY: 'auto',
        maxWidth: '600px',
        width: '100%',
    },
    header: {
        padding: spacing.xl,
        borderBottom: `1px solid ${colors.borderLight}`,
        background: `linear-gradient(135deg, ${colors.darkBg} 0%, ${colors.darkBgSecondary} 100%)`,
        color: colors.textLight,
        borderRadius: `${radius.xl} ${radius.xl} 0 0`,
    },
    body: {
        padding: spacing.xl,
    },
    footer: {
        padding: spacing.xl,
        borderTop: `1px solid ${colors.borderLight}`,
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spacing.md,
    },
};

// Alert styles
export const alertStyles = {
    success: {
        backgroundColor: colors.successLight,
        borderColor: colors.success,
        color: '#1e5631',
        borderLeft: `4px solid ${colors.success}`,
        padding: spacing.lg,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
    error: {
        backgroundColor: colors.errorLight,
        borderColor: colors.error,
        color: '#7b241c',
        borderLeft: `4px solid ${colors.error}`,
        padding: spacing.lg,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
    warning: {
        backgroundColor: colors.warningLight,
        borderColor: colors.warning,
        color: '#7d6608',
        borderLeft: `4px solid ${colors.warning}`,
        padding: spacing.lg,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
    info: {
        backgroundColor: colors.infoLight,
        borderColor: colors.info,
        color: '#1f5a8f',
        borderLeft: `4px solid ${colors.info}`,
        padding: spacing.lg,
        borderRadius: radius.md,
        marginBottom: spacing.lg,
    },
};

// Table styles
export const tableStyles = {
    container: {
        backgroundColor: 'white',
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        overflowX: 'auto',
        border: `1px solid ${colors.borderLight}`,
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: typography.base,
    },
    thead: {
        backgroundColor: colors.darkBg,
        color: colors.textLight,
    },
    th: {
        padding: spacing.lg,
        textAlign: 'left',
        fontWeight: '600',
        borderBottom: `2px solid ${colors.border}`,
    },
    td: {
        padding: spacing.lg,
        borderBottom: `1px solid ${colors.borderLight}`,
    },
    rowHover: {
        backgroundColor: colors.surfaceLight,
    },
};

export default {
    colors,
    spacing,
    typography,
    radius,
    shadows,
    transitions,
    buttonStyles,
    inputStyles,
    cardStyles,
    modalStyles,
    alertStyles,
    tableStyles,
};
