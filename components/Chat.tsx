import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Send, 
    Search, 
    MoreVertical, 
    Users, 
    Plus, 
    Trash2, 
    Shield, 
    UserX, 
    Check, 
    X,
    BookOpen,
    MessageSquare,
    UserPlus,
    ChevronDown,
    ChevronRight,
    Camera,
    Image as ImageIcon,
    Folder,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    CheckCircle,
    MoreHorizontal
} from 'lucide-react';
import { User, ChatMessage, ChatRoom, ChatRoomType, UserRole, Course, Pole, AttendanceRecord } from '../types';
import { Button, Badge } from './ui/DesignSystem';
import { getStudentStats } from '../services/utils';

interface ChatProps {
    currentUser: User;
    users: User[];
    courses: Course[];
    poles: Pole[];
    attendance: AttendanceRecord[];
}

interface Community {
    id: string;
    name: string;
    isSystem?: boolean;
}

const Chat: React.FC<ChatProps> = ({ currentUser, users, courses, poles, attendance }) => {
    // --- STATE ---
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
    const [inputText, setInputText] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    
    // UI States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createMode, setCreateMode] = useState<'GROUP' | 'COMMUNITY'>('GROUP');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [showRoomInfo, setShowRoomInfo] = useState(false);
    
    // Member View State
    const [viewingMember, setViewingMember] = useState<User | null>(null);
    
    // Create Form States
    const [newItemName, setNewItemName] = useState('');
    const [selectedCommunityId, setSelectedCommunityId] = useState('');
    const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
    const [memberToAdd, setMemberToAdd] = useState('');

    // Media & Camera
    const [isMediaMenuOpen, setIsMediaMenuOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        const poleCommunities = poles.map(p => ({ id: p.id, name: p.name, isSystem: true }));
        setCommunities(prev => {
            const custom = prev.filter(c => !c.isSystem);
            const generalExists = custom.find(c => c.id === 'GENERAL');
            const generalComm = generalExists ? [] : [{ id: 'GENERAL', name: 'Général', isSystem: true }];
            const allComms = [...generalComm, ...poleCommunities, ...custom];
            const uniqueComms = Array.from(new Map(allComms.map(item => [item.id, item])).values());
            return uniqueComms;
        });

        setExpandedSections(prev => {
            const defaults: Record<string, boolean> = { 'GENERAL': true };
            poles.forEach(p => defaults[p.id] = true);
            return { ...defaults, ...prev };
        });

        if (rooms.length === 0) {
            const classRooms: ChatRoom[] = courses.map(c => {
                const professorIds = c.professorIds || [];
                const students = users.filter(u => u.role === UserRole.STUDENT && u.classId === c.id).map(u => u.id);
                return {
                    id: `class-${c.id}`,
                    name: c.name,
                    type: ChatRoomType.CLASS,
                    courseId: c.id,
                    communityId: c.pole, 
                    memberIds: [...professorIds, ...students],
                    adminIds: [...professorIds, '1'],
                    createdAt: new Date().toISOString()
                };
            });

            const poleGeneralRooms: ChatRoom[] = poles.map(p => ({
                id: `pole-general-${p.id}`,
                name: `Annonces ${p.name}`,
                type: ChatRoomType.GROUP,
                communityId: p.id,
                memberIds: users.map(u => u.id),
                adminIds: users.filter(u => u.role === UserRole.ADMIN || u.managedPole === p.id).map(u => u.id),
                createdAt: new Date().toISOString()
            }));

            const generalRoom: ChatRoom = {
                id: 'general',
                name: 'Annonces Générales',
                type: ChatRoomType.GROUP,
                communityId: 'GENERAL',
                memberIds: users.map(u => u.id),
                adminIds: users.filter(u => u.role === UserRole.ADMIN).map(u => u.id),
                createdAt: new Date().toISOString()
            };

            const staffRoom: ChatRoom = {
                id: 'staff',
                name: 'Salle des Profs',
                type: ChatRoomType.GROUP,
                communityId: 'GENERAL',
                memberIds: users.filter(u => u.role !== UserRole.STUDENT).map(u => u.id),
                adminIds: users.filter(u => u.role === UserRole.ADMIN).map(u => u.id),
                createdAt: new Date().toISOString()
            };

            const allInitialRooms = [...poleGeneralRooms, ...classRooms, generalRoom, staffRoom];
            const visibleRooms = allInitialRooms.filter(r => 
                currentUser.role === UserRole.ADMIN || 
                r.memberIds.includes(currentUser.id) || 
                r.adminIds.includes(currentUser.id)
            );

            setRooms(visibleRooms);
            if (visibleRooms.length > 0) setActiveRoomId(visibleRooms[0].id);

            setMessages([
                { id: '1', roomId: 'general', senderId: '1', senderName: 'Admin Insan', content: 'Bienvenue sur la messagerie.', timestamp: new Date().toISOString() }
            ]);
        }
    }, [courses, users, poles]);

    // --- HELPERS ---
    const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId), [rooms, activeRoomId]);
    const activeMessages = useMemo(() => messages.filter(m => m.roomId === activeRoomId), [messages, activeRoomId]);
    
    const canManageRoom = (room: ChatRoom) => {
        if (!room) return false;
        if (currentUser.role === UserRole.ADMIN) return true;
        if (room.adminIds.includes(currentUser.id)) return true;
        if (room.type === ChatRoomType.CLASS && currentUser.role === UserRole.PROFESSOR && room.memberIds.includes(currentUser.id)) return true;
        return false;
    };

    const isSystemCommunity = (id: string) => {
        return poles.some(p => p.id === id) || id === 'GENERAL';
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [activeMessages, selectedImage]);

    // --- ACTIONS: MESSAGING ---
    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if ((!inputText.trim() && !selectedImage) || !activeRoomId) return;
        
        const newMsg: ChatMessage = {
            id: Date.now().toString(),
            roomId: activeRoomId,
            senderId: currentUser.id,
            senderName: currentUser.name,
            content: inputText,
            timestamp: new Date().toISOString(),
            attachmentUrl: selectedImage || undefined,
            attachmentType: selectedImage ? 'image' : undefined
        };

        setMessages(prev => [...prev, newMsg]);
        setInputText('');
        setSelectedImage(null);
    };

    const handleDeleteMessage = (msgId: string) => {
        const msg = messages.find(m => m.id === msgId);
        if (!msg) return;
        const canDelete = msg.senderId === currentUser.id || currentUser.role === UserRole.ADMIN || (activeRoom && canManageRoom(activeRoom));
        if (canDelete) {
            if (currentUser.role === UserRole.ADMIN || window.confirm("Supprimer ce message définitivement ?")) {
                setMessages(prev => prev.filter(m => m.id !== msgId));
            }
        }
    };

    // --- ACTIONS: MANAGEMENT ---
    const handleDeleteCommunity = (commId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isSystemCommunity(commId) && currentUser.role !== UserRole.ADMIN) {
            alert("Impossible de supprimer une communauté système.");
            return;
        }
        if (window.confirm("Supprimer cette communauté et TOUS les groupes associés ?")) {
            setCommunities(prev => prev.filter(c => c.id !== commId));
            setRooms(prev => prev.filter(r => r.communityId !== commId));
            const roomsToDelete = rooms.filter(r => r.communityId === commId).map(r => r.id);
            setMessages(prev => prev.filter(m => !roomsToDelete.includes(m.roomId)));
            if (activeRoom?.communityId === commId) setActiveRoomId(null);
        }
    };

    const handleDeleteRoom = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!activeRoom) return;
        if (!canManageRoom(activeRoom)) {
            alert("Accès refusé.");
            return;
        }
        if (window.confirm(`Supprimer le groupe "${activeRoom.name}" ?`)) {
            setRooms(prev => prev.filter(r => r.id !== activeRoom.id));
            setMessages(prev => prev.filter(m => m.roomId !== activeRoom.id));
            setActiveRoomId(null);
            setShowRoomInfo(false);
        }
    };

    const handleRemoveMember = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation(); 
        if (!activeRoom || !canManageRoom(activeRoom)) return;
        if (window.confirm("Retirer cet utilisateur du groupe ?")) {
            setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, memberIds: r.memberIds.filter(id => id !== userId) } : r));
        }
    };

    const handleAddMemberToRoom = () => {
        if (!activeRoom || !memberToAdd || !canManageRoom(activeRoom)) return;
        if (activeRoom.memberIds.includes(memberToAdd)) { alert("Déjà membre."); return; }
        setRooms(prev => prev.map(r => r.id === activeRoom.id ? { ...r, memberIds: [...r.memberIds, memberToAdd] } : r));
        setMemberToAdd('');
    };

    const handleCreate = () => {
        if (!newItemName.trim()) return;

        if (createMode === 'COMMUNITY') {
            const newCommId = `comm-${Date.now()}`;
            setCommunities(prev => [...prev, { id: newCommId, name: newItemName, isSystem: false }]);
            setExpandedSections(prev => ({ ...prev, [newCommId]: true }));
            const defaultRoom: ChatRoom = {
                id: `group-gen-${Date.now()}`,
                name: 'Général',
                type: ChatRoomType.GROUP,
                communityId: newCommId,
                memberIds: users.map(u => u.id),
                adminIds: [currentUser.id],
                createdAt: new Date().toISOString()
            };
            setRooms(prev => [defaultRoom, ...prev]);
            setActiveRoomId(defaultRoom.id);
        } else {
            const targetCommunityId = selectedCommunityId || 'GENERAL';
            const newRoom: ChatRoom = {
                id: `group-${Date.now()}`,
                name: newItemName,
                type: ChatRoomType.GROUP,
                communityId: targetCommunityId,
                memberIds: [...selectedMemberIds, currentUser.id],
                adminIds: [currentUser.id],
                createdAt: new Date().toISOString()
            };
            setRooms(prev => [newRoom, ...prev]);
            setActiveRoomId(newRoom.id);
            setExpandedSections(prev => ({ ...prev, [targetCommunityId]: true }));
        }

        setIsCreateModalOpen(false);
        setNewItemName('');
        setSelectedMemberIds([]);
        setSelectedCommunityId('');
    };

    // --- CAMERA ---
    const startCamera = async () => {
        try {
            setIsCameraOpen(true);
            setIsMediaMenuOpen(false);
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setCameraStream(stream);
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            setIsCameraOpen(false);
            alert("Accès caméra impossible.");
        }
    };

    const stopCamera = () => {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                setSelectedImage(canvas.toDataURL('image/jpeg', 0.8));
                stopCamera();
            }
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setSelectedImage(reader.result as string); setIsMediaMenuOpen(false); };
            reader.readAsDataURL(file);
        }
    };

    const toggleMemberSelection = (userId: string) => {
        setSelectedMemberIds(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]);
    };

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl animate-fade-in">
            {/* SIDEBAR */}
            <div className="w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="font-black text-xl text-slate-800 dark:text-white">Discussions</h2>
                        <button onClick={() => { setIsCreateModalOpen(true); setCreateMode('GROUP'); }} className="p-2 bg-insan-blue text-white rounded-xl hover:bg-blue-900 transition-colors shadow-lg shadow-blue-500/20">
                            <Plus size={20}/>
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                        <input className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                    {communities.map(comm => {
                        const commRooms = rooms.filter(r => r.communityId === comm.id && r.name.toLowerCase().includes(searchTerm.toLowerCase()));
                        const isExpanded = expandedSections[comm.id];
                        if (commRooms.length === 0 && searchTerm) return null;
                        return (
                            <div key={comm.id} className="mb-2 group/comm">
                                <div className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors">
                                    <button onClick={() => setExpandedSections(prev => ({ ...prev, [comm.id]: !prev[comm.id] }))} className="flex-1 flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                        <span className="flex items-center gap-2">{comm.isSystem ? <BookOpen size={12}/> : <Folder size={12}/>}{comm.name}</span>
                                        {isExpanded ? <ChevronDown size={14}/> : <ChevronRight size={14}/>}
                                    </button>
                                    {!comm.isSystem && currentUser.role === UserRole.ADMIN && (
                                        <button onClick={(e) => handleDeleteCommunity(comm.id, e)} className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover/comm:opacity-100 transition-opacity"><Trash2 size={12}/></button>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="space-y-1 mt-1 pl-2 border-l-2 border-slate-100 dark:border-slate-800 ml-3">
                                        {commRooms.map(room => (
                                            <button key={room.id} onClick={() => { setActiveRoomId(room.id); setShowRoomInfo(false); }} className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-all ${activeRoomId === room.id ? 'bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800' : 'hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}>
                                                <div className={`w-2 h-2 rounded-full shrink-0 ${room.name.includes('Annonces') || room.name === 'Général' ? 'bg-green-500' : 'bg-insan-blue'}`}></div>
                                                <p className={`text-sm font-bold truncate ${activeRoomId === room.id ? 'text-slate-800 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>{room.name}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* MAIN CHAT AREA */}
            <div className="flex-1 flex flex-col bg-slate-50/50 dark:bg-slate-900 relative">
                {activeRoom ? (
                    <>
                        <div className="h-16 px-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">{activeRoom.name.charAt(0)}</div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white">{activeRoom.name}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{activeRoom.memberIds.length} participants</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                {canManageRoom(activeRoom) && <button onClick={handleDeleteRoom} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={20}/></button>}
                                <button onClick={() => setShowRoomInfo(!showRoomInfo)} className={`p-2 rounded-lg transition-colors ${showRoomInfo ? 'bg-slate-100 dark:bg-slate-800 text-insan-blue' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><MoreVertical size={20}/></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-[#f0f2f5] dark:bg-[#0b1120]">
                            {activeMessages.map((msg) => {
                                const isMe = msg.senderId === currentUser.id;
                                return (
                                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                                        <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                                            {!isMe && <span className="text-[10px] text-slate-500 ml-1 mb-1 font-bold">{msg.senderName}</span>}
                                            <div className={`relative px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-insan-blue text-white rounded-br-none' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-700'}`}>
                                                {msg.attachmentUrl && <div className="mb-2 rounded-lg overflow-hidden border border-white/20"><img src={msg.attachmentUrl} className="max-w-full max-h-60 object-cover" /></div>}
                                                {msg.content}
                                                <span className={`text-[9px] block text-right mt-1 opacity-70 ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                            </div>
                                            {(isMe || canManageRoom(activeRoom)) && (
                                                <button onClick={() => handleDeleteMessage(msg.id)} className={`mt-1 text-[10px] text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity`}>Supprimer</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 relative">
                            {selectedImage && (
                                <div className="absolute bottom-full left-0 w-full p-4 bg-slate-100/90 dark:bg-slate-800/90 backdrop-blur-md flex flex-col gap-2 z-10 animate-fade-in">
                                    <div className="flex justify-between items-center"><p className="text-xs font-bold text-slate-500">Image jointe</p><button onClick={() => setSelectedImage(null)} className="p-1 bg-slate-200 dark:bg-slate-700 rounded-full"><X size={14}/></button></div>
                                    <img src={selectedImage} className="max-h-48 rounded-xl shadow-lg border border-white dark:border-slate-600 mx-auto" />
                                </div>
                            )}
                            {isMediaMenuOpen && (
                                <div className="absolute bottom-20 left-4 bg-white dark:bg-slate-800 shadow-xl rounded-xl border border-slate-100 dark:border-slate-700 p-2 flex flex-col gap-1 z-20 w-48">
                                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors">
                                        <div className="p-2 bg-purple-100 text-purple-600 rounded-full"><ImageIcon size={18}/></div> Fichier
                                    </button>
                                    <button onClick={startCamera} className="flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-200 text-sm font-bold transition-colors">
                                        <div className="p-2 bg-red-100 text-red-600 rounded-full"><Camera size={18}/></div> Caméra
                                    </button>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                            <form onSubmit={handleSendMessage} className="flex gap-2 items-end">
                                <button type="button" onClick={() => setIsMediaMenuOpen(!isMediaMenuOpen)} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200"><Plus size={20}/></button>
                                <input className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-insan-blue/20 dark:text-white" placeholder="Écrivez..." value={inputText} onChange={(e) => setInputText(e.target.value)} />
                                <button type="submit" disabled={(!inputText.trim() && !selectedImage)} className="p-3 bg-insan-orange text-white rounded-xl hover:bg-orange-600 disabled:opacity-50 shadow-lg">
                                    <Send size={20}/>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600">
                        <MessageSquare size={48} className="opacity-50 mb-4"/>
                        <h3 className="font-black text-xl text-slate-800 dark:text-white">Messagerie Interne</h3>
                    </div>
                )}
            </div>

            {/* INFO SIDEBAR */}
            {showRoomInfo && activeRoom && (
                <div className="w-80 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 flex flex-col animate-fade-in">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-3xl font-bold text-slate-500 mb-4 shadow-inner">{activeRoom.name.charAt(0)}</div>
                            <h3 className="font-black text-xl text-slate-800 dark:text-white leading-tight">{activeRoom.name}</h3>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                        <div>
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Shield size={12}/> Admins</h4>
                            <div className="space-y-3">{activeRoom.adminIds.map(adminId => { const admin = users.find(u => u.id === adminId); return admin ? (
                                <div key={adminId} onClick={() => setViewingMember(admin)} className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                    <img src={admin.avatar} className="w-8 h-8 rounded-full"/><div className="flex-1 min-w-0"><p className="text-xs font-bold text-slate-800 dark:text-white truncate">{admin.name}</p></div>
                                </div>
                            ) : null; })}</div>
                        </div>
                        {canManageRoom(activeRoom) && (
                            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Ajouter un participant</label>
                                <div className="flex gap-2"><select className="flex-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2 outline-none dark:text-white" value={memberToAdd} onChange={(e) => setMemberToAdd(e.target.value)}><option value="">Choisir...</option>{users.filter(u => !activeRoom.memberIds.includes(u.id)).map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select><button onClick={handleAddMemberToRoom} disabled={!memberToAdd} className="p-2 bg-insan-blue text-white rounded-lg"><UserPlus size={16}/></button></div>
                            </div>
                        )}
                        <div>
                            <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2"><Users size={12}/> Membres ({activeRoom.memberIds.length})</h4>
                            <div className="space-y-3">{activeRoom.memberIds.filter(id => !activeRoom.adminIds.includes(id)).map(memberId => { const member = users.find(u => u.id === memberId); return member ? (
                                <div key={memberId} onClick={() => setViewingMember(member)} className="flex items-center justify-between group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3"><img src={member.avatar} className="w-8 h-8 rounded-full"/><p className="text-xs font-bold text-slate-700 dark:text-slate-300">{member.name}</p></div>
                                    {canManageRoom(activeRoom) && <button onClick={(e) => handleRemoveMember(e, memberId)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><UserX size={14}/></button>}
                                </div>
                            ) : null; })}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* CREATE MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-fade-in">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-black text-lg text-slate-800 dark:text-white">Créer...</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-500"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4">
                                <button onClick={() => setCreateMode('GROUP')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${createMode === 'GROUP' ? 'bg-white dark:bg-slate-700 shadow-sm text-insan-blue dark:text-white' : 'text-slate-500'}`}>Nouveau Groupe</button>
                                <button onClick={() => setCreateMode('COMMUNITY')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${createMode === 'COMMUNITY' ? 'bg-white dark:bg-slate-700 shadow-sm text-insan-blue dark:text-white' : 'text-slate-500'}`}>Nouvelle Communauté</button>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Nom</label>
                                <input className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold outline-none dark:text-white" value={newItemName} onChange={e => setNewItemName(e.target.value)} autoFocus />
                            </div>
                            {createMode === 'GROUP' && (
                                <>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Communauté</label>
                                        <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold outline-none dark:text-white" value={selectedCommunityId} onChange={e => setSelectedCommunityId(e.target.value)}>
                                            <option value="">Général</option>
                                            {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-2">Inviter ({selectedMemberIds.length})</label>
                                        <div className="h-40 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl p-2 space-y-1">
                                            {users.filter(u => u.id !== currentUser.id).map(user => (
                                                <div key={user.id} onClick={() => toggleMemberSelection(user.id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${selectedMemberIds.includes(user.id) ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${selectedMemberIds.includes(user.id) ? 'bg-insan-blue border-insan-blue text-white' : 'border-slate-300 dark:border-slate-600'}`}>{selectedMemberIds.includes(user.id) && <Check size={12}/>}</div>
                                                    <img src={user.avatar} className="w-8 h-8 rounded-full"/><div className="flex-1"><p className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.name}</p></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                            <Button onClick={handleCreate} className="w-full py-4" disabled={!newItemName.trim()}>{createMode === 'GROUP' ? 'Créer le groupe' : 'Créer la communauté'}</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* MEMBER PROFILE MODAL */}
            {viewingMember && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-sm shadow-2xl overflow-hidden animate-fade-in relative border border-slate-100 dark:border-slate-800">
                        <button onClick={() => setViewingMember(null)} className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/40 rounded-full transition-colors text-white z-10 backdrop-blur-sm"><X size={20}/></button>
                        <div className="h-32 bg-insan-blue dark:bg-blue-900 w-full relative"><div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div></div>
                        <div className="px-8 pb-8 -mt-16 flex flex-col items-center text-center relative">
                            <img src={viewingMember.avatar} className="w-32 h-32 rounded-3xl border-4 border-white dark:border-slate-900 shadow-xl object-cover" alt={viewingMember.name}/>
                            <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-4">{viewingMember.name}</h3>
                            <Badge className="mt-2" color="blue">{viewingMember.role}</Badge>
                            {viewingMember.role === UserRole.STUDENT && (
                                <div className="grid grid-cols-3 gap-2 w-full mt-6 mb-4">
                                    {(() => {
                                        const stats = getStudentStats(viewingMember.id, viewingMember.classId || '', attendance);
                                        return (<><div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30 flex flex-col items-center"><span className="text-green-600 dark:text-green-400 font-black text-lg">{stats.rate}%</span><span className="text-[9px] font-bold uppercase">Présence</span></div><div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30 flex flex-col items-center"><span className="text-red-500 dark:text-red-400 font-black text-lg">{stats.absent}</span><span className="text-[9px] font-bold uppercase">Absences</span></div><div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-100 dark:border-orange-900/30 flex flex-col items-center"><span className="text-orange-500 dark:text-orange-400 font-black text-lg">{stats.late}</span><span className="text-[9px] font-bold uppercase">Retards</span></div></>);
                                    })()}
                                </div>
                            )}
                            <div className="w-full mt-4 space-y-3">
                                {viewingMember.email && <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-insan-blue dark:text-blue-400"><Mail size={18}/></div><div className="text-left overflow-hidden"><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{viewingMember.email}</p></div></div>}
                                {viewingMember.phone && <div className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 group cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><div className="p-2 bg-white dark:bg-slate-700 rounded-xl shadow-sm text-green-500 dark:text-green-400"><Phone size={18}/></div><div className="text-left"><p className="text-[10px] font-bold text-slate-400 uppercase">Téléphone</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{viewingMember.phone}</p></div></div>}
                            </div>
                            <Button className="w-full mt-8 py-4" onClick={() => setViewingMember(null)}>Fermer</Button>
                        </div>
                    </div>
                </div>
            )}

            {/* CAMERA MODAL */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
                    <div className="relative w-full h-full flex flex-col">
                        <video ref={videoRef} autoPlay playsInline className="flex-1 w-full object-cover" style={{transform: 'scaleX(-1)'}}/>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="absolute bottom-0 w-full p-8 flex items-center justify-between bg-gradient-to-t from-black/80 to-transparent">
                            <button onClick={stopCamera} className="p-4 rounded-full bg-white/10 text-white"><X size={24}/></button>
                            <button onClick={capturePhoto} className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 transition-all"><div className="w-16 h-16 bg-white rounded-full"></div></button>
                            <div className="w-14"></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;