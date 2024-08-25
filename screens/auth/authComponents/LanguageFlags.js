import React, { useState } from 'react';
import {
    Image,
    Platform,
    SafeAreaView,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import { useTranslation } from 'react-i18next';

// const SCREEN_HEIGHT = Dimensions.get('window').height;
// const SCREEN_WIDTH = Dimensions.get('window').width;

const LanguageFlags = () => {

    const { i18n } = useTranslation();
    const lang = i18n.language;

    const [show, setShow] = useState(false);
    const [langs, setLangs] = useState([
        {
            lang: 'ar',
            flag: require('../../../assets/icons/flags/sa.png')
        },
        {
            lang: 'es',
            flag: require('../../../assets/icons/flags/es.png')
        },
        {
            lang: 'en',
            flag: require('../../../assets/icons/flags/gb.png')
        },
        {
            lang: 'fr',
            flag: require('../../../assets/icons/flags/fr.png')
        },
        {
            lang: 'de',
            flag: require('../../../assets/icons/flags/de.png')
        },
        {
            lang: 'ie',
            flag: require('../../../assets/icons/flags/ie.png')
        },
        {
            lang: 'nl',
            flag: require('../../../assets/icons/flags/nl.png')
        },
        {
            lang: 'pt',
            flag: require('../../../assets/icons/flags/pt.png')
        }
    ]);

    const change = (lang) => {
        i18n.changeLanguage(lang);

        toggle();
    }

    /**
     * Return the flag image path for the currently active language
     */
    const getCurrentFlag = () => {
        return langs.find(lng => lng.lang === lang).flag;
    }

    /**
     * Show or hide available languages
     */
    const toggle = () => {
        setShow(!show);
    }

    return (
        <SafeAreaView style={styles.top}>
            {show ? (
                langs.map(lang => (
                    <TouchableOpacity
                        key={lang.lang}
                        onPress={() => change(lang.lang)}>
                        <Image
                            source={lang.flag}
                            resizeMethod="auto"
                            resizeMode="cover"
                            style={[
                                styles.imageStyle,
                                {
                                    marginBottom: 12
                                }
                            ]}
                        />
                    </TouchableOpacity>
                ))
            ) : (
                <TouchableOpacity onPress={toggle}>
                    <Image
                        resizeMethod="auto"
                        resizeMode="cover"
                        style={styles.imageStyle}
                        source={getCurrentFlag()}
                    />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    top: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 20 : 40,
        right: 20,
        zIndex: 1
    },
    imageStyle: {borderRadius: 4, width: 60, height: 40}
});

// LanguageFlags = Animatable.createAnimatableComponent(LanguageFlags);

export default LanguageFlags;
