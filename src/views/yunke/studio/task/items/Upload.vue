<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-upload
      :before-upload="handleBeforeUpload"
      :before-remove="handleBeforeRemove"
      :on-success="handleSuccess"
      :file-list="fileList"
      :action="uploadUrl"
      class="upload-demo"
      :headers="headers"
      multiple
      :limit="3"
      drag
    >
      <i class="el-icon-upload" />
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
    </el-upload>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">取消</el-button>
      <el-button type="primary" plain @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>
<script>

import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validateFileExt } from '@/utils/my-validate'
export default {
  name: 'Upload',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    type: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      uploadUrl: qiNiuUrl,
      fileList: [],
      files: [],
      screenWidth: 0,
      buttonLoading: false,
      width: this.initWidth()
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
      }
    }
  },
  mounted() {
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initWidth() {
      this.screenWidth = document.body.clientWidth
      if (this.screenWidth < 991) {
        return '90%'
      } else if (this.screenWidth < 1400) {
        return '45%'
      } else {
        return '500px'
      }
    },
    // 刷新列表数据
    doSubmit() {
      this.fileList = []
      this.isVisible = false
      this.dialogImageUrl = ''
      this.dialog = false
      this.$emit('success')
      this.files = []
    },
    handleSuccess(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
    },
    handleBeforeRemove(file, fileList) {
      for (let i = 0; i < this.files.length; i++) {
        if (this.files[i].uid === file.uid) {
          this.$delete(`oss/content/${this.files[i].id}`).then(() => {
            this.$message({
              message: '删除成功',
              type: 'success'
            })
          })
          return true
        }
      }
    },
    handleBeforeUpload(file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: '上传文件大小不能超过5MB!',
          type: 'error'
        })
        return false
      } else {
        const ext = file.name.replace(/.+\./, '')
        if (!validateFileExt(ext)) {
          this.$message({
            type: 'error',
            message: '禁止上传' + ext + '类型的附件'
          })
          return false
        }
      }
    },
    close() {
      this.fileList = []
      this.dialogImageUrl = ''
      this.$emit('close')
    }
  }
}
</script>
