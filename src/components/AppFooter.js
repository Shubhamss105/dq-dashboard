import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter>
      <div className='mx-auto'>
        <a href="https://letsdq.com/" target="_blank" rel="noopener noreferrer">
          DQ
        </a>
        <span className="ms-1">&copy; 2024.</span>
        <span className="ms-1">&copy; Created by DQ Developers</span>
      </div>
     
    </CFooter>
  )
}

export default React.memo(AppFooter)
