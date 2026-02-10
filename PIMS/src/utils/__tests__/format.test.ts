import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatDate, formatDateTime, maskPhone, maskIdNumber, formatFileSize, getStatusConfig } from '../format'

// Mock dayjs
vi.mock('dayjs', () => {
  const mockDayjs = (date: any) => ({
    format: (fmt: string) => {
      if (!date) return ''
      // 简单模拟格式化
      if (fmt === 'YYYY-MM-DD') return '2026-01-15'
      if (fmt === 'YYYY-MM-DD HH:mm:ss') return '2026-01-15 10:30:00'
      return String(date)
    }
  })
  return { default: mockDayjs }
})

describe('format utils', () => {
  describe('formatDate', () => {
    it('should format a date string', () => {
      expect(formatDate('2026-01-15')).toBe('2026-01-15')
    })

    it('should return empty string for empty input', () => {
      expect(formatDate('')).toBe('')
    })
  })

  describe('formatDateTime', () => {
    it('should format a datetime string', () => {
      expect(formatDateTime('2026-01-15 10:30:00')).toBe('2026-01-15 10:30:00')
    })

    it('should return empty string for empty input', () => {
      expect(formatDateTime('')).toBe('')
    })
  })

  describe('maskPhone', () => {
    it('should mask middle 4 digits', () => {
      expect(maskPhone('13800138000')).toBe('138****8000')
    })

    it('should return original string if not 11 digits', () => {
      expect(maskPhone('1234')).toBe('1234')
    })

    it('should return empty for empty input', () => {
      expect(maskPhone('')).toBe('')
    })
  })

  describe('maskIdNumber', () => {
    it('should mask middle digits of id number', () => {
      const result = maskIdNumber('110101199001011234')
      expect(result).toBe('110********1234')
    })

    it('should return original for short strings', () => {
      expect(maskIdNumber('12345')).toBe('12345')
    })
  })

  describe('formatFileSize', () => {
    it('should return "0 B" for zero', () => {
      expect(formatFileSize(0)).toBe('0 B')
    })

    it('should format bytes', () => {
      expect(formatFileSize(500)).toBe('500 B')
    })

    it('should format kilobytes', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
    })

    it('should format megabytes', () => {
      expect(formatFileSize(1048576)).toBe('1 MB')
    })

    it('should format with decimal', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB')
    })
  })

  describe('getStatusConfig', () => {
    it('should return correct config for active status', () => {
      const config = getStatusConfig('active')
      expect(config.text).toBe('正常')
      expect(config.color).toBe('success')
    })

    it('should return correct config for draft status', () => {
      const config = getStatusConfig('draft')
      expect(config.text).toBe('草稿')
      expect(config.color).toBe('default')
    })

    it('should return default for unknown status', () => {
      const config = getStatusConfig('unknown')
      expect(config.text).toBe('unknown')
      expect(config.color).toBe('default')
    })
  })
})
