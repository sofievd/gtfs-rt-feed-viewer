import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'

import {library} from '@fortawesome/fontawesome-svg-core'
import {faChevronDown} from '@fortawesome/free-solid-svg-icons'
import {faChevronUp} from '@fortawesome/free-solid-svg-icons'
import {faChevronRight} from '@fortawesome/free-solid-svg-icons'
import {faAngleDown } from '@fortawesome/free-solid-svg-icons'
import { faAngleUp } from '@fortawesome/free-solid-svg-icons'
import {faFile} from '@fortawesome/free-regular-svg-icons'

library.add(faChevronDown, faChevronRight, faChevronUp, faAngleDown , faAngleUp, faFile)


createApp(App).mount('#app')
