/**
 * File utility functions for handling file icons, sizes, and types
 */

import React from 'react';
import { FileText, Image, File, FileSpreadsheet, FileCode, Archive, Video, Music } from 'lucide-react';

/**
 * Get appropriate Lucide React icon component with colors for a file type
 * @param fileType - File type/extension (e.g., 'pdf', 'jpg', 'docx')
 * @param size - Size class (default: 'h-5 w-5')
 * @returns React element with colored icon
 */
export const getFileIconWithColor = (fileType: string, size: string = 'h-5 w-5') => {
  if (!fileType) return <File className={`${size} text-gray-500`} />;
  
  const type = fileType.toLowerCase();
  
  // Images - Green
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(type)) {
    return <Image className={`${size} text-green-500`} />;
  }
  
  // PDFs - Red
  if (type.includes('pdf') || type === 'pdf') {
    return <FileText className={`${size} text-red-500`} />;
  }
  
  // Documents (Word, etc.) - Blue
  if (type.includes('document') || type.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(type)) {
    return <FileText className={`${size} text-blue-600`} />;
  }
  
  // Presentations - Purple
  if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(type)) {
    return <FileText className={`${size} text-purple-500`} />;
  }
  
  // Spreadsheets - Orange
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(type)) {
    return <FileSpreadsheet className={`${size} text-orange-500`} />;
  }
  
  // Code files - Yellow
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'php', 'py', 'java', 'cpp', 'c'].includes(type)) {
    return <FileCode className={`${size} text-yellow-600`} />;
  }
  
  // Archives - Indigo
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(type)) {
    return <Archive className={`${size} text-indigo-500`} />;
  }
  
  // Video - Pink
  if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) {
    return <Video className={`${size} text-pink-500`} />;
  }
  
  // Audio - Teal
  if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(type)) {
    return <Music className={`${size} text-teal-500`} />;
  }
  
  // Default - Gray
  return <File className={`${size} text-gray-500`} />;
};

/**
 * Get appropriate Lucide React icon component for a file type (without colors)
 * @param fileType - File type/extension (e.g., 'pdf', 'jpg', 'docx')
 * @returns React component class for the file icon
 */
export const getFileIcon = (fileType: string) => {
  if (!fileType) return File;
  
  const type = fileType.toLowerCase();
  
  // Images
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(type)) {
    return Image;
  }
  
  // PDFs
  if (type.includes('pdf') || type === 'pdf') {
    return FileText;
  }
  
  // Documents (Word, etc.)
  if (type.includes('document') || type.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(type)) {
    return FileText;
  }
  
  // Presentations
  if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(type)) {
    return FileText;
  }
  
  // Spreadsheets
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(type)) {
    return FileSpreadsheet;
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'php', 'py', 'java', 'cpp', 'c'].includes(type)) {
    return FileCode;
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(type)) {
    return Archive;
  }
  
  // Video
  if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) {
    return Video;
  }
  
  // Audio
  if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(type)) {
    return Music;
  }
  
  // Default
  return File;
};

/**
 * Get emoji icon for a file type (for simpler displays)
 * @param fileType - File type/extension
 * @returns Emoji string representing the file type
 */
export const getFileTypeIcon = (fileType: string): string => {
  if (!fileType) return '📁';
  
  const type = fileType.toLowerCase();
  
  // Images
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(type)) {
    return '🖼️';
  }
  
  // PDFs
  if (type.includes('pdf') || type === 'pdf') {
    return '📄';
  }
  
  // Documents (Word, etc.)
  if (type.includes('document') || type.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(type)) {
    return '📝';
  }
  
  // Presentations
  if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(type)) {
    return '📋';
  }
  
  // Spreadsheets
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(type)) {
    return '📊';
  }
  
  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'php', 'py', 'java', 'cpp', 'c'].includes(type)) {
    return '💻';
  }
  
  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(type)) {
    return '🗜️';
  }
  
  // Video
  if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) {
    return '🎥';
  }
  
  // Audio
  if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(type)) {
    return '🎵';
  }
  
  // Text files
  if (['txt', 'md', 'log'].includes(type)) {
    return '📄';
  }
  
  // Default
  return '📁';
};

/**
 * Format file size from bytes to human readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type category for grouping
 * @param fileType - File type/extension
 * @returns Category string
 */
export const getFileCategory = (fileType: string): string => {
  if (!fileType) return 'Other';
  
  const type = fileType.toLowerCase();
  
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'].includes(type)) {
    return 'Image';
  }
  
  if (type.includes('pdf') || type === 'pdf') {
    return 'PDF';
  }
  
  if (type.includes('document') || type.includes('word') || ['doc', 'docx', 'odt', 'rtf'].includes(type)) {
    return 'Document';
  }
  
  if (type.includes('presentation') || ['ppt', 'pptx', 'odp'].includes(type)) {
    return 'Presentation';
  }
  
  if (type.includes('spreadsheet') || ['xls', 'xlsx', 'ods', 'csv'].includes(type)) {
    return 'Spreadsheet';
  }
  
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'xml', 'php', 'py', 'java', 'cpp', 'c'].includes(type)) {
    return 'Code';
  }
  
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(type)) {
    return 'Archive';
  }
  
  if (type.includes('video') || ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(type)) {
    return 'Video';
  }
  
  if (type.includes('audio') || ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(type)) {
    return 'Audio';
  }
  
  return 'Other';
};

/**
 * Check if a file type is viewable in browser
 * @param fileType - File type/extension
 * @returns Boolean indicating if file can be previewed
 */
export const isPreviewable = (fileType: string): boolean => {
  if (!fileType) return false;
  
  const type = fileType.toLowerCase();
  
  // Images
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(type)) {
    return true;
  }
  
  // PDFs
  if (type.includes('pdf') || type === 'pdf') {
    return true;
  }
  
  // Text files
  if (['txt', 'md', 'json', 'xml', 'csv', 'html', 'css', 'js'].includes(type)) {
    return true;
  }
  
  return false;
};
