import React, { useMemo, useRef, useState } from 'react';
import { Alert, Image, ImageBackground, Pressable, SafeAreaView, ScrollView, Share, StyleSheet, Text, TextInput, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import { LinearGradient } from 'expo-linear-gradient';

type Mode = 'payment' | 'link' | 'text';
type Template = { id: string; name: string; fg: string; bg: string; dot: string };
const C = { ink: '#172018', muted: '#758078', paper: '#F7F8F3', card: '#FFFFFF', green: '#1C8A55', dark: '#12613B', mint: '#DDF4E7', line: '#E6EBE4', orange: '#FFB15A' };
const templates: Template[] = [
  { id: 'leaf', name: 'Leaf', fg: '#12613B', bg: '#FFFFFF', dot: '#1C8A55' },
  { id: 'midnight', name: 'Midnight', fg: '#FFFFFF', bg: '#172018', dot: '#8BE5B4' },
  { id: 'sunset', name: 'Sunset', fg: '#8B3A18', bg: '#FFF6E7', dot: '#FF9C4A' },
  { id: 'ink', name: 'Ink', fg: '#101512', bg: '#FFFFFF', dot: '#101512' },
];

function Field({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) {
  return <View style={styles.fieldWrap}><Text style={styles.fieldLabel}>{label}</Text><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#A5AEA7" keyboardType={keyboardType} style={styles.input} autoCapitalize="none" /></View>;
}

export default function App() {
  const [mode, setMode] = useState<Mode>('payment');
  const [upiId, setUpiId] = useState('yourname@upi');
  const [payee, setPayee] = useState('My Store');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Payment');
  const [link, setLink] = useState('https://example.com');
  const [text, setText] = useState('Scan to connect with me');
  const [selectedTemplate, setSelectedTemplate] = useState('leaf');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [tab, setTab] = useState<'create' | 'templates' | 'saved'>('create');
  const qrRef = useRef<any>(null);
  const qrPreviewRef = useRef<View>(null);
  const template = templates.find((item) => item.id === selectedTemplate) ?? templates[0];
  const qrValue = useMemo(() => {
    if (mode === 'payment') {
      const params = [`pa=${encodeURIComponent(upiId.trim())}`, `pn=${encodeURIComponent(payee.trim() || 'UPI Payment')}`, amount.trim() ? `am=${encodeURIComponent(amount.trim())}` : '', 'cu=INR', note.trim() ? `tn=${encodeURIComponent(note.trim())}` : ''].filter(Boolean);
      return `upi://pay?${params.join('&')}`;
    }
    return mode === 'link' ? link.trim() : text;
  }, [amount, link, mode, note, payee, text, upiId]);
  const copyValue = async () => { await Clipboard.setStringAsync(qrValue); Alert.alert('Copied', 'QR content clipboard mein copy ho gaya.'); };
  const shareValue = async () => { await Share.share({ message: qrValue }); };
  const pickBackground = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Gallery permission', 'Photo background ke liye gallery permission allow karein.'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    if (!result.canceled && result.assets[0]?.uri) setBackgroundImage(result.assets[0].uri);
  };
  const saveQr = async () => {
    try {
      if (!qrPreviewRef.current) { Alert.alert('Try again', 'QR preview ready hone ke baad dobara tap karein.'); return; }
      const uri = await captureRef(qrPreviewRef, { format: 'png', quality: 1, result: 'tmpfile' });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'QR code share karein' });
      else Alert.alert('QR ready', 'QR image local temporary storage mein save ho gayi.');
    } catch { Alert.alert('Could not save', 'QR image export nahi ho paayi.'); }
  };
  return <SafeAreaView style={styles.safe}><StatusBar style="dark" /><ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
    <View style={styles.headerRow}><View style={styles.brandLockup}><View style={styles.logoBox}><Image source={require('./assets/scanly-logo.png')} style={styles.logoImage} /></View><View><Text style={styles.title}>Scanly <Text style={styles.titleAccent}>QR</Text></Text><Text style={styles.subtitle}>Payment aur har link ka QR.</Text></View></View><Pressable style={styles.plusButton} onPress={pickBackground}><Text style={styles.plusText}>＋</Text></Pressable></View>
    <View style={styles.tabs}><Tab label="Create" active={tab === 'create'} onPress={() => setTab('create')} /><Tab label="Templates" active={tab === 'templates'} onPress={() => setTab('templates')} /><Tab label="Saved" active={tab === 'saved'} onPress={() => setTab('saved')} /></View>
    {tab === 'templates' ? <View><Text style={styles.sectionTitle}>QR ka look choose karein</Text><Text style={styles.sectionHint}>Har style instantly preview mein dikhega.</Text><View style={styles.templateGrid}>{templates.map((item) => <Pressable key={item.id} onPress={() => setSelectedTemplate(item.id)} style={[styles.templateCard, selectedTemplate === item.id && styles.templateSelected]}><View style={[styles.templatePreview, { backgroundColor: item.bg }]}><QRCode value="scanly" size={62} color={item.fg} backgroundColor={item.bg} quietZone={2} /></View><Text style={styles.templateName}>{item.name}</Text>{selectedTemplate === item.id && <Text style={styles.selectedMark}>✓</Text>}</Pressable>)}</View></View> : tab === 'saved' ? <View><Text style={styles.sectionTitle}>Recent creations</Text><View style={styles.empty}><Text style={styles.emptyIcon}>◌</Text><Text style={styles.emptyTitle}>Abhi kuch saved nahi hai</Text><Text style={styles.emptyText}>Aapke recent QR yahan dikhenge.</Text></View></View> : <View>
      <Text style={styles.sectionTitle}>Aap kya banana chahte hain?</Text><View style={styles.modeRow}><ModeButton icon="₹" title="Payment" active={mode === 'payment'} onPress={() => setMode('payment')} /><ModeButton icon="↗" title="Link" active={mode === 'link'} onPress={() => setMode('link')} /><ModeButton icon="T" title="Text" active={mode === 'text'} onPress={() => setMode('text')} /></View>
      <View style={styles.formCard}>{mode === 'payment' ? <><Field label="UPI ID" value={upiId} onChangeText={setUpiId} placeholder="name@upi" /><Field label="Payee name" value={payee} onChangeText={setPayee} placeholder="Shop ya person ka naam" /><View style={styles.twoFields}><View style={{ flex: 1 }}><Field label="Amount (optional)" value={amount} onChangeText={setAmount} placeholder="₹ 0" keyboardType="decimal-pad" /></View><View style={{ flex: 1 }}><Field label="Note" value={note} onChangeText={setNote} placeholder="Payment" /></View></View></> : mode === 'link' ? <Field label="Paste your link" value={link} onChangeText={setLink} placeholder="https://..." keyboardType="url" /> : <Field label="Your message" value={text} onChangeText={setText} placeholder="Text yahan likhein" />}</View>
      <View style={styles.previewHead}><Text style={styles.sectionTitle}>Preview</Text><Pressable onPress={pickBackground} style={styles.photoButton}><Text style={styles.photoButtonText}>{backgroundImage ? 'Change photo' : 'Add photo'}</Text></Pressable></View><View ref={qrPreviewRef} collapsable={false} style={styles.qrCard}>{backgroundImage ? <ImageBackground source={{ uri: backgroundImage }} style={styles.photoQrStage} imageStyle={styles.photoQrImage}><View style={styles.qrPaper}><QRCode getRef={(ref: any) => { qrRef.current = ref; }} value={qrValue || 'scanly'} size={178} color={template.fg === '#FFFFFF' ? '#172018' : template.fg} backgroundColor="#FFFFFF" quietZone={8} /></View></ImageBackground> : <View style={[styles.qrFrame, { backgroundColor: template.bg }]}><QRCode getRef={(ref: any) => { qrRef.current = ref; }} value={qrValue || 'scanly'} size={188} color={template.fg === '#FFFFFF' ? '#172018' : template.fg} backgroundColor={template.bg === '#172018' ? '#FFFFFF' : template.bg} quietZone={8} /></View>}<Text style={styles.qrCaption}>{mode === 'payment' ? payee || 'UPI Payment' : mode === 'link' ? 'Link QR' : 'Text QR'}</Text><Text style={styles.qrSubcaption}>{mode === 'payment' ? (amount ? `₹${amount} • UPI payment` : 'Scan karke payment karein') : 'Scanly QR code'}</Text></View><View style={styles.actionRow}><ActionButton label="Copy" icon="□" onPress={copyValue} /><ActionButton label="Share" icon="↗" onPress={shareValue} /><ActionButton label="Save QR" icon="↓" primary onPress={saveQr} /></View>
    </View>}
    <Text style={styles.footer}>Scanly QR • v1.0.1</Text>
  </ScrollView></SafeAreaView>;
}

function Tab({ label, active, onPress }: any) { return <Pressable onPress={onPress} style={[styles.tab, active && styles.tabActive]}><Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text></Pressable>; }
function ModeButton({ icon, title, active, onPress }: any) { return <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeActive]}><Text style={[styles.modeIcon, active && styles.modeIconActive]}>{icon}</Text><Text style={[styles.modeTitle, active && styles.modeTitleActive]}>{title}</Text></Pressable>; }
function ActionButton({ label, icon, onPress, primary }: any) { return <Pressable onPress={onPress} style={[styles.actionButton, primary && styles.actionPrimary]}><Text style={[styles.actionIcon, primary && { color: '#fff' }]}>{icon}</Text><Text style={[styles.actionLabel, primary && { color: '#fff' }]}>{label}</Text></Pressable>; }
function InfoBox({ text }: { text: string }) { return <View style={styles.infoBox}><Text style={styles.infoIcon}>i</Text><Text style={styles.infoText}>{text}</Text></View>; }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.paper }, container: { padding: 20, paddingBottom: 34 }, headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 19 }, brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 }, logoBox: { width: 46, height: 46, borderRadius: 15, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }, logoImage: { width: 34, height: 34 }, plusButton: { width: 42, height: 42, borderRadius: 14, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }, plusText: { color: '#FFFFFF', fontSize: 25, lineHeight: 27, fontWeight: '300' }, eyebrow: { color: C.green, fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 6 }, title: { color: C.ink, fontSize: 28, fontWeight: '900', letterSpacing: -1.1 }, titleAccent: { color: C.green }, subtitle: { color: C.muted, fontSize: 12, marginTop: 2 }, tabs: { flexDirection: 'row', backgroundColor: '#EDF0EA', borderRadius: 13, padding: 4, marginBottom: 22 }, tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 }, tabActive: { backgroundColor: C.card, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 5, elevation: 2 }, tabText: { color: C.muted, fontWeight: '700', fontSize: 13 }, tabTextActive: { color: C.ink }, sectionTitle: { fontSize: 19, fontWeight: '800', color: C.ink, marginBottom: 5 }, sectionHint: { fontSize: 13, color: C.muted, marginBottom: 16 }, modeRow: { flexDirection: 'row', gap: 10, marginBottom: 17 }, modeButton: { flex: 1, height: 76, borderRadius: 17, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }, modeActive: { backgroundColor: C.mint, borderColor: '#A9DFC0' }, modeIcon: { fontSize: 21, color: C.muted, fontWeight: '800', marginBottom: 6 }, modeIconActive: { color: C.green }, modeTitle: { fontSize: 12, color: C.muted, fontWeight: '700' }, modeTitleActive: { color: C.dark }, formCard: { backgroundColor: C.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: C.line, marginBottom: 20 }, fieldWrap: { marginBottom: 13 }, fieldLabel: { color: C.muted, fontSize: 11, fontWeight: '800', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 }, input: { height: 46, borderRadius: 12, borderWidth: 1, borderColor: C.line, color: C.ink, paddingHorizontal: 13, fontSize: 14, backgroundColor: '#FCFDFC' }, twoFields: { flexDirection: 'row', gap: 10 }, previewHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }, photoButton: { backgroundColor: C.mint, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 }, photoButtonText: { color: C.dark, fontSize: 11, fontWeight: '800' }, localPill: { color: C.green, fontSize: 10, fontWeight: '900', letterSpacing: 0.7 }, qrCard: { backgroundColor: C.card, borderRadius: 22, padding: 19, alignItems: 'center', borderWidth: 1, borderColor: C.line }, qrFrame: { padding: 5, borderRadius: 14 }, photoQrStage: { width: 220, height: 220, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: 16 }, photoQrImage: { borderRadius: 16 }, qrPaper: { backgroundColor: '#FFFFFFEE', padding: 11, borderRadius: 15 }, qrCaption: { color: C.ink, fontSize: 16, fontWeight: '800', marginTop: 14 }, qrSubcaption: { color: C.muted, fontSize: 12, marginTop: 4 }, actionRow: { flexDirection: 'row', gap: 9, marginTop: 13, marginBottom: 15 }, actionButton: { flex: 1, height: 49, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.line, flexDirection: 'row', gap: 6 }, actionPrimary: { backgroundColor: C.green, borderColor: C.green }, actionIcon: { fontSize: 16, color: C.green, fontWeight: '900' }, actionLabel: { color: C.ink, fontSize: 12, fontWeight: '800' }, infoBox: { flexDirection: 'row', gap: 9, padding: 13, backgroundColor: '#EEF6F0', borderRadius: 14, marginTop: 4 }, infoIcon: { color: C.green, borderWidth: 1, borderColor: C.green, width: 17, height: 17, borderRadius: 9, textAlign: 'center', fontSize: 11, fontWeight: '900' }, infoText: { flex: 1, color: C.muted, fontSize: 11, lineHeight: 17 }, templateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 }, templateCard: { width: '47%', padding: 10, backgroundColor: C.card, borderRadius: 17, borderWidth: 1, borderColor: C.line, position: 'relative' }, templateSelected: { borderColor: C.green, borderWidth: 2 }, templatePreview: { height: 108, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, templateName: { color: C.ink, fontWeight: '800', fontSize: 13, marginTop: 9 }, selectedMark: { position: 'absolute', right: 11, bottom: 10, color: C.green, fontWeight: '900' }, empty: { alignItems: 'center', paddingVertical: 45, paddingHorizontal: 20 }, emptyIcon: { fontSize: 50, color: '#BCD8C5', marginBottom: 12 }, emptyTitle: { color: C.ink, fontWeight: '800', fontSize: 16 }, emptyText: { color: C.muted, textAlign: 'center', fontSize: 13, lineHeight: 19, marginTop: 7 }, footer: { textAlign: 'center', color: '#9BA59D', fontSize: 10, marginTop: 26 },
});
