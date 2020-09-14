<template>
  <el-dialog
    :title="title"
    :width="width"
    top="3vh"
    :close-on-click-modal="false" 
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="copyright" :rules="rules" label-position="right" label-width="100px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="copyright.title"  />
      </el-form-item>
      <el-form-item label="摘要" >
        <el-input v-model="copyright.introduction"  />
      </el-form-item>
      <el-form-item label="开始时间">
        <el-col>
          <el-date-picker
            v-model="copyright.startTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            style="width:100%"
            >
          </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="结束时间">
        <el-col>
          <el-date-picker
            v-model="copyright.endTime"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            style="width:100%"
            >
          </el-date-picker>
        </el-col>
      </el-form-item>
      <el-form-item label="花费" prop="cost">
        <el-input v-model.number="copyright.cost" />
      </el-form-item>
      <el-form-item :label="$t('table.user.status')" prop="state">
        <el-radio-group v-model="copyright.state">
          <el-radio :label="1">进行中</el-radio>
          <el-radio :label="2">已完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="报销" prop="reimbursement">
        <el-radio-group v-model="copyright.reimbursement">
          <el-radio :label="0">未报销</el-radio>
          <el-radio :label="1">已报销</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="负责人" >
        <el-select filterable allow-create default-first-option v-model="team.reliable"  value="" placeholder="负责人" style="width:100%">
          <el-option
            v-for="item in userRoles"
            :key="item.userId"
            :label="item.fullName"
            :value="String(item.userId)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="成员" >
        <el-select filterable allow-create default-first-option v-model="team.member" multiple value="" placeholder="成员(不包含负责人)" style="width:100%">
          <el-option
            v-for="item in userRoles"
            :key="item.userId"
           :label="item.fullName"
            :value="String(item.userId)"
         />
        </el-select>
      </el-form-item>
      <el-form-item label="指导老师" >
        <el-select filterable allow-create default-first-option v-model="team.teacher" multiple value="" placeholder="指导老师" style="width:100%">
          <el-option
            v-for="item in teacherRoles"
            :key="item.userId"
            :label="item.fullName"
            :value="String(item.userId)"
          />
        </el-select>
      </el-form-item>
       <el-form-item label="项目名称" prop="itemId">
         <el-select  v-model="copyright.itemId"  value="" placeholder="选择项目名称" style="width:100%">
          <el-option
            v-for="item in itemsIds"
            :key="item.itemsId"
            :label="item.title"
            :value="String(item.itemsId)"
          />
        </el-select>
      </el-form-item>
      <!-- 发票 -->
      <el-form-item label="发票" prop="invoice">
        <!-- <el-button size="small" type="primary" @click="upload('发票')">点击上传</el-button> -->
        <el-upload
          :before-upload="handleBeforeUploadInvoice"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessInvoice"
          :file-list="fileList"
          :action="uploadUrl"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          accept=".jpg,.jpeg,.png,.gif,.bmp"
          :headers="headers"
          multiple
          :limit="uploadPicLimit"
          list-type="picture-card"
          drag
        >
          <i class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 证书 -->
      <el-form-item label="证书" prop="certificate">
        <!-- <el-button size="small" type="primary" @click="upload('发票')">点击上传</el-button> -->
        <el-upload
          :before-upload="handleBeforeUploadInvoice"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessCertificate"
          :file-list="fileList"
          :action="uploadUrl"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          accept=".jpg,.jpeg,.png,.gif,.bmp"
          :headers="headers"
          multiple
          :limit="uploadPicLimit"
          list-type="picture-card"
          drag
        >
          <i class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 源文件 -->
      <el-form-item label="源文件" prop="originFile">
       <el-input v-model="copyright.originFile" />
        <!-- <el-upload
          :before-upload="handleBeforeUploadUrl"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessOriginFile"
          :file-list="fileList"
          :action="uploadUrl"
          accept=".doc,.pdf,.docx,.ppt,.rar,.zip,.arj,.gz,.tar,.tar.gz"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          :headers="headers"
          :limit="uploadDocTarLimit"
          list-type="picture-card"
          drag
        >
          <i  class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传1个附件，且文件不超过10M</div>
        </el-upload> -->
      </el-form-item>
      <!-- 申请书 -->
      <el-form-item label="申请书" prop="applicationForm">
        <!-- <el-input v-model="tasks.url" /> -->
        <el-upload
          :before-upload="handleBeforeUploadSpecif"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessApplicationForm"
          :file-list="fileList"
          :action="uploadUrl"
          accept=".doc,.docx,.pdf,.ppt"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          :headers="headers"
          :limit="uploadDocTarLimit"
          drag
        >
          <i  class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传1个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 软件协议 -->
      <el-form-item label="软件协议" prop="certificate">
        <!-- <el-button size="small" type="primary" @click="upload('发票')">点击上传</el-button> -->
        <el-upload
          :before-upload="handleBeforeUploadSpecif"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessAgreement"
          :file-list="fileList"
          :action="uploadUrl"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          :headers="headers"
          accept=".doc,.docx,.pdf,.ppt"
          multiple
          :limit="uploadDocTarLimit"
          drag
        >
          <i class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传1个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="primary" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
</template>
<script>
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validatePicExt, validateFileExt, validateFileTarExt, validateFileDocmentExt } from '@/utils/my-validate'

export default {
  name: 'ItemsEdit',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 上传图片数量限制
      uploadPicLimit: 3,
      // 上传文档和压缩包数量限制
      uploadDocTarLimit: 1,
      // 超过图片数量限制时隐藏上传组件
      editrepairinvoicehideupload: false,
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      uploadUrl: qiNiuUrl,
      initFlag: false,
      fileList: [],
      files: [],
      // 保存图片地址
      fileUrlList: [],
      copyright: this.initCopyRright(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      itemsIds: [],
      userRoles: [],
      teacherRoles: [],
      // 负责人，成员，指导老师
      team: {
        reliable: '',
        member: [],
        teacher: []
      },
      copyrightRoles: [{
        roleId: 1,
        roleName: '负责人'
      },
      {
        roleId: 2,
        roleName: '成员'
      }
      ],
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20', trigger: 'blur' }],
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        itemId: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        cost: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { type: 'number', message: '年龄必须为数字值'}]
      }
    }
  },
  computed: {
    isVisible: {
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
    this.initItemsIds()
    this.initUserRoles()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initCopyRright() {
      return {
        copyrightId: '',
        itemId: '',
        title: '',
        introduction: '',
        startTime: '',
        endTime: '',
        cost: 0.0,
        invoice: '',
        certificate: '',
        applicationForm: '',
        originFile: '',
        agreement: '',
        state: 1,
        reimbursement: 0,
        userId: [],
        m_state: []
      }
    },
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
    initItemsIds() {
      this.$get('studio/items').then((r) => {
        const itemsIds = []
        const rows = r.data.data.rows
        rows.forEach((v, i) => {
          const obj = {
            itemsId: v.itemsId,
            title: v.title
          }
          itemsIds.push(obj)
        })
        this.itemsIds = itemsIds
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
      })
    },
    initUserRoles() {
       // 获取老师角色
      this.$get('system/user/queryUserByNoteIds',{
        noteIds: "1,0"
      }).then((r) => {
        const teacherRoles = []
        const rows = r.data.data
        rows.forEach((v, i) => {
          const obj = {
            userId: v.userId,
            fullName: v.fullName
          }
         teacherRoles.push(obj)
        })
        this.teacherRoles = teacherRoles
      })
      // 获取学生角色
       this.$get('system/user/queryUserByNoteIds',{
        noteIds: "2,3,4,0"
      }).then((r) => {
        const userRoles = []
        const rows = r.data.data
        rows.forEach((v, i) => {
          const obj = {
            userId: v.userId,
            fullName: v.fullName
          }
         userRoles.push(obj)
        })
        this.userRoles = userRoles
      })
    },
    setCopyRight(val) {
      // 浅克隆，同一源里的数值也会改变
      // this.editForm = row;
      this.copyright = Object.assign({}, val)
      this.team.reliable = val.reliable
      this.team.member = val.member
      this.team.teacher = val.teacher
      if (this.copyright.invoice.length > 1) {
        this.fileUrlList = this.copyright.invoice.split(',')
      } else {
        this.fileUrlList = this.copyright.invoice
      }
      for (var i = 0; i < this.fileUrlList.length; i++) {
        var fileurl = this.fileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.fileList.push({
            name: fileurl.substring(28),
            url: fileurl
          })
        }
      }
    },
    close() {
      this.team = {
        reliable: '',
        member: [],
        teacher: []
      }
      this.doSubmit()
      this.$emit('close')
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.copyright.copyrightId) {
            // create
            // 调用getDge
            const copyright = this.copyright
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            this.doSubmit()
            copyright.userId = a
            copyright.m_state = b
            this.$post('studio/copyright', { ...copyright }).then(() => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.createSuccess'),
                type: 'success'
              })
              this.$emit('success')
              this.team = {
                reliable: '',
                member: [],
                teacher: []
              }
            })
          } else {
            // update
            const copyright = this.copyright
            copyright.reimbursement = parseInt(copyright.reimbursement)
            copyright.state = parseInt(copyright.state)
            // 调用getDge
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              this.isVisible = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            copyright.userId = a
            copyright.m_state = b
            delete copyright.members
            const updateState = {
              state: copyright.state,
              copyrightId: copyright.copyrightId
            }
            this.$put('studio/copyright/state', { ...updateState })
            this.$put('studio/copyright', { ...copyright }).then((r) => {
              this.buttonLoading = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
            this.isVisible = false
          }
        } else {
          return false
        }
      })
    },
    getDge(reliable, member, teacher) {
      const reliableArr = []
      const memberArr = []
      const teacherArr = []
      // 负责人
      reliable = reliable.split()
      reliable.forEach((v, i) => {
        reliableArr.push('1')
      })
      // 成员
      member.forEach((v, i) => {
        memberArr.push('2')
      })
      // 指导老师
      teacher.forEach((v, i) => {
        teacherArr.push('3')
      })
      let a = [...reliable, ...member, ...teacher]
      const b = [...reliableArr, ...memberArr, ...teacherArr].join(',')
      // 进行判断是否多次选择同一个人
      let flag = false
      var obj = {}
      console.log(22,a)
      for (var i = 0; i < a.length; i++) {
        if (obj[a[i]]) flag = true
        obj[a[i]] = true
      }
      a = a.join(',')
      return {
        a,
        b,
        flag
      }
    },
    reset() {
      // 先清除校验，再清除表单，不然有奇怪的bug
      this.$refs.form.clearValidate()
      this.$refs.form.resetFields()
      this.copyright = this.initCopyRright()
    },
    // 发票上传
    handleSuccessInvoice(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.copyright.invoice === '' || this.copyright.invoice === null) {
        this.copyright.invoice = response.data.url
      } else {
        this.copyright.invoice = this.copyright.invoice + ',' + response.data.url
      }
    },
    // 源文件上传
    // handleSuccessOriginFile(response, file, fileList) {
    //   const uid = file.uid
    //   const id = response.data.contentId
    //   this.files.push({ uid, id })
    //   if (this.copyright.originFile === '' || this.copyright.originFile === null) {
    //     this.copyright.originFile = response.data.url
    //   } else {
    //     this.copyright.originFile = this.copyright.originFile + ',' + response.data.url
    //   }
    // },
    // 申请书上传
    handleSuccessApplicationForm(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.copyright.applicationForm === '' || this.copyright.applicationForm === null) {
        this.copyright.applicationForm = response.data.url
      } else {
        this.copyright.applicationForm = this.copyright.applicationForm + ',' + response.data.url
      }
    },
    // 证书上传
    handleSuccessCertificate(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.copyright.certificate === '' || this.copyright.certificate === null) {
        this.copyright.certificate = response.data.url
      } else {
        this.copyright.certificate = this.copyright.certificate + ',' + response.data.url
      }
    },
    // 软件协议上传
    handleSuccessAgreement(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.copyright.agreement === '' || this.copyright.agreement === null) {
        this.copyright.agreement = response.data.url
      } else {
        this.copyright.agreement = this.copyright.agreement + ',' + response.data.url
      }
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
    handleBeforeUploadInvoice(file) {
      if (file.size / 1024 > 5000) {
        this.$message({
          message: '上传文件大小不能超过5MB!',
          type: 'error'
        })
        return false
      } else {
        const ext = file.name.replace(/.+\./, '')
        if (!validatePicExt(ext)) {
          this.$message({
            type: 'error',
            message: '禁止上传' + ext + '类型的附件'
          })
          return false
        }
      }
    },
    // handleBeforeUploadUrl(file) {
    //   if (file.size / 1024 > 10000) {
    //     this.$message({
    //       message: '上传文件大小不能超过10MB!',
    //       type: 'error'
    //     })
    //     return false
    //   } else {
    //     const ext = file.name.replace(/.+\./, '')
    //     if (!validateFileExt(ext)) {
    //       this.$message({
    //         type: 'error',
    //         message: '禁止上传' + ext + '类型的附件'
    //       })
    //       return false
    //     }
    //   }
    // },
    handleBeforeUploadSpecif(file) {
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
    // 刷新列表数据
    doSubmit() {
      this.fileList = []
      this.fileUrlList = []
      this.dialogImageUrl = ''
      this.dialog = false
    }
  }
}
</script>
<style lang="scss" scoped>
</style>
