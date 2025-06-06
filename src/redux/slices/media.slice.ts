import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface IState {
  selectedMedia: string | null
  isOpenModalUpload: boolean
}

const initialState: IState = {
  selectedMedia: null,
  isOpenModalUpload: false
}

const mediaSlice = createSlice({
  name: 'media',
  initialState,
  reducers: {
    setSelectedMedia: (state, action) => {
      state.selectedMedia = action.payload
    },
    clearSelectedMedia: (state) => {
      state.selectedMedia = null
    },
    setIsOpenModalUpload: (state, action: PayloadAction<boolean>) => {
      state.isOpenModalUpload = action.payload
    }
  }
})

export const { setSelectedMedia, clearSelectedMedia, setIsOpenModalUpload } = mediaSlice.actions

export default mediaSlice.reducer
