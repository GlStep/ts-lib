import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Component from '../Component.vue'

describe('sample Test Suite', () => {
  it('mounts', () => {
    const wrapper = mount(Component, {
      props: {
        message: 'Test in Vitest',
      },
    })

    expect(wrapper.exists()).toBe(true)
  })
})
