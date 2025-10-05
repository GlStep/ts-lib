import { install as MyLibPLugin } from '@glstep/lib'
import { createApp } from 'vue'
import App from './App.vue'
import './index.css'

const app = createApp(App)

// app.use(MyLibPLugin)
app.mount('#app')
