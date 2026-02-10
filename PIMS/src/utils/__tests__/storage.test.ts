import { describe, it, expect, beforeEach } from 'vitest'
import { getStorage, setStorage, removeStorage, clearStorage, getListFromStorage, saveListToStorage } from '../storage'

describe('storage utils', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('setStorage', () => {
    it('should store data with pims_ prefix', () => {
      setStorage('test_key', { name: 'test' })
      const stored = localStorage.getItem('pims_test_key')
      expect(stored).toBe(JSON.stringify({ name: 'test' }))
    })

    it('should not double-prefix keys that already have pims_', () => {
      setStorage('pims_test_key', 'value')
      const stored = localStorage.getItem('pims_test_key')
      expect(stored).toBe(JSON.stringify('value'))
    })
  })

  describe('getStorage', () => {
    it('should retrieve and parse stored data', () => {
      localStorage.setItem('pims_test_key', JSON.stringify({ name: 'test' }))
      const result = getStorage('test_key')
      expect(result).toEqual({ name: 'test' })
    })

    it('should return null for non-existing key', () => {
      expect(getStorage('non_existing')).toBeNull()
    })
  })

  describe('removeStorage', () => {
    it('should remove item from storage', () => {
      localStorage.setItem('pims_test_key', '"value"')
      removeStorage('test_key')
      expect(localStorage.getItem('pims_test_key')).toBeNull()
    })
  })

  describe('clearStorage', () => {
    it('should only remove pims_ prefixed items', () => {
      // Set pims items and a non-pims item
      localStorage.setItem('pims_item1', '"value1"')
      localStorage.setItem('pims_item2', '"value2"')
      localStorage.setItem('other_item', '"value3"')
      
      clearStorage()
      
      // pims_ items should be removed
      expect(localStorage.getItem('pims_item1')).toBeNull()
      expect(localStorage.getItem('pims_item2')).toBeNull()
      // non-pims item should remain
      expect(localStorage.getItem('other_item')).toBe('"value3"')
    })
  })

  describe('getListFromStorage / saveListToStorage', () => {
    it('should return empty array if no data', () => {
      expect(getListFromStorage('empty_list')).toEqual([])
    })

    it('should save and retrieve a list', () => {
      const list = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }]
      saveListToStorage('my_list', list)
      
      const result = getListFromStorage('my_list')
      expect(result).toEqual(list)
    })
  })
})
