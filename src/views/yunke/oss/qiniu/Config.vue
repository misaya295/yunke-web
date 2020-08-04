<template>
  <el-dialog
    :title="title"
    :width="width"
    top="50px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isConfigVisible"
  >
    <el-form ref="form" :model="qiNiuConfig" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="Access Key" prop="accessKey">
        <el-input v-model="qiNiuConfig.accessKey" maxlength="60" placeholder="accessKey，在安全中心，秘钥管理中查看" />
      </el-form-item>
      <el-form-item label="Secret Key" prop="secretKey">
        <el-input v-model="qiNiuConfig.secretKey" maxlength="60" type="password" show-password placeholder="secretKey，在安全中心，秘钥管理中查看" />
      </el-form-item>
      <el-form-item label="空间名称" prop="bucket">
        <el-input v-model="qiNiuConfig.bucket" maxlength="60" placeholder="存储空间名称作为唯一的 Bucket 识别符" />
      </el-form-item>
      <el-form-item label="外链域名" prop="host">
        <el-input v-model="qiNiuConfig.host" maxlength="60" placeholder="外链域名，可自定义，需在七牛云绑定" />
      </el-form-item>
      <el-form-item label="存储区域" prop="zone">
        <el-select v-model="qiNiuConfig.zone" style="width:100%" placeholder="请选择存储区域">
          <el-option
            v-for="item in zones"
            :key="item"
            :label="item"
            :value="item"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="空间类型" prop="type">
        <el-radio v-model="qiNiuConfig.type" label="公开">公开</el-radio>
        <el-radio v-model="qiNiuConfig.type" label="私有">私有</el-radio>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isConfigVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import { validURL } from '@/utils/my-validate'

export default {
  name: 'QiNiuConfig',
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
      zones: ['华东', '华北', '华南', '北美', '东南亚'],
      screenWidth: 0,
      buttonLoading: false,
      width: this.initWidth(),
      qiNiuConfig: this.initConfig(),
      rules: {
        accessKey: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        secretKey: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        bucket: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        host: [{
          required: true, message: this.$t('rules.require'), trigger: 'blur' },
        { validator: (rule, value, callback) => {
          if (value !== '' && value != null && !validURL(value)) {
            callback(new Error(this.$t('rules.invalidURL')))
          } else {
            callback()
          }
        }, trigger: 'blur' }
        ],
        zone: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }],
        type: [{ required: true, message: this.$t('rules.require'), trigger: 'blur' }]
      }
    }
  },
  computed: {
    isConfigVisible: {
      get() {
        return this.dialogVisible
      },
      set() {
        this.close()
        this.reset()
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
        return '800px'
      }
    },
    initConfig() {
      return {
        configId: '',
        accessKey: '',
        bucket: '',
        host: '',
        secretKey: '',
        type: '',
        zone: ''
      }
    },
    setConfig(val) {
      this.qiNiuConfig = { ...val }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$put('oss/config', { ...this.qiNiuConfig }).then(() => {
            this.buttonLoading = false
            this.isVisible = false
            this.$message({
              message: this.$t('tips.updateSuccess'),
              type: 'success'
            })
            this.$emit('success')
          })
        }
      })
    },
    close() {
      this.$emit('close')
    },
    reset() {
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
    }
  }
}
</script>
