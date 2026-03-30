import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Modal } from 'react-native'; // Simple modal for now as ActionSheet
import { LibraryResource } from '../types';

interface ResourceActionSheetProps {
    visible: boolean;
    onClose: () => void;
    resource: LibraryResource;
    onBookmark: () => void;
    onAddToCollection: () => void;
    onShare: () => void;
}

export const ResourceActionSheet: React.FC<ResourceActionSheetProps> = ({
    visible,
    onClose,
    resource,
    onBookmark,
    onAddToCollection,
    onShare,
}) => {
    return (
        <Modal>
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}>
                    <TouchableOpacity >
                style={styles.overlay} 
                activeOpacity={1} 
                onPress={onClose}>
                            <View style={styles.content}                    <View style={styles.handle} /                    ><View style={styles.header}                        <MaterialCommunityIcons 
                            name={resource.type === 'video' ? 'play-circle' : 'file-document'} 
                            size={24} 
                            color="#2E5CFF" 
                        /                        ><Text style={styles.title} numberOfLines={1}>{resource.title}</Text                    ></View
                    ><ScrollView style={styles.optionsList}                        <TouchableOpacity style={styles.option} onPress={() => { onBookmark(); onClose(); }}                            <MaterialCommunityIcons 
                                name={resource.has_bookmarked ? "bookmark" : "bookmark-outline"} 
                                size={22} 
                                color={resource.has_bookmarked ? "#2E5CFF" : "#666"} 
                            /                            ><Text style={[styles.optionText, resource.has_bookmarked && styles.activeText]}                                {resource.has_bookmarked ? "Bookmarked" : "Bookmark"}
                            </Text                        ></TouchableOpacity
                        <TouchableOpacity style={styles.option} onPress={() => { onAddToCollection(); onClose(); }}                            <MaterialCommunityIcons name="folder-plus-outline" size={22} color="#666" /                            ><Text style={styles.optionText}>Add to Collection</Text                        ></TouchableOpacity
                        <TouchableOpacity style={styles.option} onPress={() => { onShare(); onClose(); }}                            <MaterialCommunityIcons name="share-variant-outline" size={22} color="#666" /                            ><Text style={styles.optionText}>Share Resource</Text                        ></TouchableOpacity                    </ScrollView
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}                        <Text style={styles.cancelText}>Cancel</Text                    </TouchableOpacity                </View            </TouchableOpacity        </Modal    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    content: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        maxHeight: '60%',
    },
    handle: {
        width: 40,
        height: 5,
        backgroundColor: '#EEE',
        borderRadius: 3,
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111',
        marginLeft: 10,
        flex: 1,
    },
    optionsList: {
        marginBottom: 10,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 15,
    },
    activeText: {
        color: '#2E5CFF',
        fontWeight: '500',
    },
    cancelButton: {
        paddingVertical: 15,
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        marginTop: 10,
    },
    cancelText: {
        fontSize: 16,
        color: '#FF3B30',
        fontWeight: '600',
    },
});
