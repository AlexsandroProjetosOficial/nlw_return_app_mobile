import { ArrowLeft } from 'phosphor-react-native';
import React, { useState } from 'react';
import {
    View,
    TextInput,
    Image,
    TouchableOpacity,
    Text
} from 'react-native';
import * as FileSystem from 'expo-file-system';

import { Button } from '../Button';
import { ScreenshotButton } from '../ScreenshotButton';
import { FeedbackType } from '../Widget';

import { feedbackTypes } from '../../utils/feedbackTypes';

import { theme } from '../../theme';
import { styles } from './styles';
import { captureScreen } from 'react-native-view-shot';
import { api } from '../../libs/api';

interface Props {
    feedbackType: FeedbackType;
    onFeedbackCanceled: () => void;
    onFeedbackSent: () => void;
}

export function Form({ feedbackType, onFeedbackCanceled, onFeedbackSent }: Props) {
    const [screenshot, setScreenshot] = useState<string | null>(null);
    const [isSendingFeedback, setIsSendingFeedback] = useState<boolean>(false);
    const [comment, setComment] = useState<string>('');

    const feedbackTypeInfo = feedbackTypes[feedbackType];

    const handleScreenshot = () => {
        captureScreen({
            format: 'jpg',
            quality: 0.8
        })
            .then(uri => setScreenshot(uri))
            .catch(error => console.error(error))
    }

    const handleSendFeedback = async () => {
        if(isSendingFeedback) {
            return;
        }

        setIsSendingFeedback(oldState => !oldState);

        const screenshotBase64 = screenshot && await FileSystem.readAsStringAsync(screenshot, { encoding: 'base64' });

        try {
            const data = {
                type: feedbackType, 
                comment: comment,
                screenshot: `data:image/png;base64,${screenshotBase64}`
            }

            const result = await api.post('/feedbacks', data);

            if(result) {
                onFeedbackSent();
            }
        } catch (error) {
            console.log(error);
            setIsSendingFeedback(false);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onFeedbackCanceled}
                >
                    <ArrowLeft
                        size={24}
                        weight='bold'
                        color={theme.colors.text_secondary}
                    />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Image
                        style={styles.image}
                        source={feedbackTypeInfo.image}
                    />
                    <Text style={styles.titleText}>
                        {feedbackTypeInfo.title}
                    </Text>
                </View>
            </View>

            <TextInput
                multiline
                style={styles.input}
                placeholder='Conte com detalhes o que está acontecendo...'
                placeholderTextColor={theme.colors.text_secondary}
                autoCorrect={false}
                onChangeText={setComment}
            />
            <View style={styles.footer}>
                <ScreenshotButton
                    onTakeShot={handleScreenshot}
                    onRemoveShot={() => setScreenshot(null)}
                    screenshot={screenshot}
                />

                <Button isLoading={isSendingFeedback} onPress={handleSendFeedback}/>
            </View>
        </View>
    );
}
