import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Modal } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LibraryCollection } from '../types';

interface CollectionPickerModalProps {
    visible: boolean;
    onClose: () => void;
    collections: LibraryCollection[];
    onSelect: (collectionId: string) => void;
    isAdding: boolean;
}

export const CollectionPickerModal: React.FC<CollectionPickerModalProps> = ({
    visible,
    onClose,
    collections,
    onSelect,
    isAdding,
}) => {
    return (
        <Modal>
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
                    <View style={styles.overlay}                <View style={styles.content}                    <View style={styles.header}                        <Text style={styles.title}>Add to Collection</Text                        ><TouchableOpacity onPress={onClose}                            <MaterialCommunityIcons name="close" size={24} color="#666" /                        ></TouchableOpacity                    ></View
                    <FlatList>
                        data={collections}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity >
                                style={styles.item} 
                                onPress={() => onSelect(item.id)}
                                disabled={isAdding}
                                                            <MaterialCommunityIcons >
                                    name={item.visibility === 'private' ? 'lock' : 'folder-outline'} 
                                    size={20} 
                                    color="#666" 
                                /                                <View style={styles.itemInfo}                                    <Text style={styles.itemName}>{item.name}</Text                                    ><View style={styles.badgeContainer}                                        <Text style={styles.badgeText}>{item.visibility}</Text                                    ></View                                ></View                                ><MaterialCommunityIcons name="chevron-right" size={20} color="#CCC" /                            ></TouchableOpacity                        )}
                        ListEmptyComponent={
                            <View style={styles.empty}                                <Text style={styles.emptyText}>No collections found.</Text                            </View                        }
                    /                </View            </View        </Modal    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    content: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        maxHeight: '70%',
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F9F9F9',
    },
    itemInfo: {
        flex: 1,
        marginLeft: 15,
    },
    itemName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    badgeContainer: {
        backgroundColor: '#F0F2FF',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    badgeText: {
        fontSize: 10,
        color: '#2E5CFF',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    empty: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
    },
});
