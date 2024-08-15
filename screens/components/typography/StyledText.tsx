import React from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { Colors, Fonts } from '../theme';
import { useTranslation } from 'react-i18next';

interface StyledTextProps {
    family?: keyof typeof Fonts;
    style?: StyleProp<TextStyle>;
    color?: keyof typeof Colors;
    children?: React.ReactNode;
    dictionary?: string;
    values?: Record<string, any>;
}

const StyledText: React.FC<StyledTextProps> = ({
    family = 'semiBold',
    style,
    color = 'text',
    children,
    dictionary,
    values,
    ...rest
}) => {
    const textColor = Colors[color as keyof typeof Colors];
    const font = Fonts[family as keyof typeof Fonts];
    const { t } = useTranslation();

    const renderText = () => {
        if (dictionary) {
            return <Text style={[{ color: textColor }, font, style]} {...rest}>
                {t(dictionary, values)}
            </Text>;
        }
        return <Text style={[{ color: textColor }, font, style]} {...rest}>
            {children}
        </Text>;
    };

    return renderText();
};

export default StyledText;
