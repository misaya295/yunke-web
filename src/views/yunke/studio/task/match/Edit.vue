<template>
<div>
  <el-dialog
    :title="title"
    :width="width"
    top="3vh"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :visible.sync="isVisible"
  >
    <el-form ref="form" :model="tasks" :rules="rules" label-position="right" label-width="100px">
      <!-- 参赛时间 -->
      <el-form-item label="参赛时间:" prop="time">
        <el-date-picker
          v-model="tasks.time"
          type="date"
          placeholder="选择日期"
          align="right"
          format="yyyy-MM-dd"
          value-format="yyyy-MM-dd"
          style="width: 100%"
        />
      </el-form-item>
      <!-- 比赛名称 -->
      <el-form-item label="比赛名称:" prop="title">
        <el-input v-model="tasks.title"  />
      </el-form-item>
      <!-- 主办单位 -->
      <el-form-item label="主办单位:" prop="sponsor">
        <el-input v-model="tasks.sponsor"  />
      </el-form-item>
      <!-- 比赛类型 -->
      <el-form-item label="比赛类型:" prop="type">
        <el-radio-group v-model="tasks.type">
          <el-radio :label='0'>个人</el-radio>
          <el-radio :label='1'>团队</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛等级 -->
      <el-form-item label="比赛等级:" prop="level">
        <el-radio-group v-model="tasks.level">
          <el-radio :label='0'>国家级</el-radio>
          <el-radio :label='1'>省级</el-radio>
          <el-radio :label='2'>校级</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 比赛名次 -->
      <el-form-item label="比赛名次:" prop="rankCode">
        <el-radio-group v-model="tasks.rankCode">
          <el-radio :label='1'>一等奖</el-radio>
          <el-radio :label='2'>二等奖</el-radio>
          <el-radio :label='3'>三等奖</el-radio><br/>
          <el-radio :label='4'>特等奖</el-radio>
          <el-radio :label='5'>优胜奖</el-radio>
          <el-radio :label='6'>无</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 负责人 -->
      <el-form-item label="负责人:" >
        <el-select v-model="team.reliable" filterable allow-create default-first-option value="" placeholder="负责人" style="width:100%">
          <el-option
            v-for="match in userRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 成员 -->
      <el-form-item label="成员:" >
        <el-select v-model="team.member" filterable allow-create default-first-option multiple value="" placeholder="成员(不包含负责人)" style="width:100%">
          <el-option
            v-for="match in userRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 指导老师 -->
      <el-form-item label="指导老师:" >
        <el-select v-model="team.teacher" filterable allow-create default-first-option multiple value="" placeholder="指导老师" style="width:100%">
          <el-option
            v-for="match in teacherRoles"
            :key="match.userId"
            :label="match.fullName"
            :value="String(match.userId)"
          />
        </el-select>
      </el-form-item>
      <!-- 状态 -->
      <el-form-item label="状态:" prop="state">
        <el-radio-group v-model="tasks.state">
          <el-radio :label='1'>进行中</el-radio>
          <el-radio :label='2'>已完成</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 花费 -->
      <el-form-item label="花费:" prop="cost">
        <el-input v-model.number="tasks.cost" />
      </el-form-item>
      <!-- 是否已报销 -->
      <el-form-item label="报销情况:" prop="reimbursement">
        <el-radio-group v-model="tasks.reimbursement">
          <el-radio :label='0'>未报销</el-radio>
          <el-radio :label='1'>已报销</el-radio>
        </el-radio-group>
      </el-form-item>
      <!-- 发票 -->
      <el-form-item label="发票:" prop="invoice">
        <el-upload
          :before-upload="handleBeforeUploadInvoice"
          :before-remove="addInvoiceBeforeRemove"
          :on-success="handleSuccessInvoice"
          :on-preview="handlePreview"
          :on-change="addInvoiceChange"
          :file-list="invoiceFileList"
          :action="uploadUrl"
          :class="{hideupload:addinvoicehideupload, picturecard:true}"
          :headers="headers"
          accept=".jpg,.jpeg,.png,.gif,.bmp"
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
      <el-form-item label="证书:" prop="certificate">
        <el-upload
          :before-upload="handleBeforeUploadCertificate"
          :before-remove="addCertificateBeforeRemove"
          :on-success="handleSuccessCertificate"
  	      :on-preview="handlePreview1"
          :file-list="certificateFileList"
          :action="uploadUrl"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          :headers="headers"
          accept=".jpg,.jpeg,.png,.gif,.bmp"
          multiple
          :limit="uploadPicLimit"
          list-type="picture-card"
          drag
        >
          <i class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传3个附件，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
      <!-- 申请书 -->
      <el-form-item label="申请书:" prop="applicationForm">
        <el-upload
          :before-upload="handleBeforeUploadApply"
          :before-remove="handleBeforeRemove"
          :on-success="handleSuccessApply"
          :file-list="applyFileList"
          :action="uploadUrl"
          class="upload-demo"
          :headers="headers"
          accept=".doc,.docx,.pdf,.ppt"
          :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
          multiple
          :limit="uploadDocTarLimit"
          drag
        >
          <i class="el-icon-upload" />
          <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，<b>可同时上传1个附件</b>，且文件不超过5M</div>
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="warning" plain :loading="buttonLoading" @click="isVisible = false">
        {{ $t('common.cancel') }}
      </el-button>
      <el-button type="primary" plain :loading="buttonLoading" @click.prevent="submitForm">
        {{ $t('common.confirm') }}
      </el-button>
    </div>
  </el-dialog>
  <!-- 图片预览 -->
  <el-dialog title="图片预览" :visible.sync="previewVisible" width="40%" @close="previewDialogClose">
    <el-image :src="previewPath" alt class="previewImg" />
  </el-dialog>
</div>
</template>
<script>
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { qiNiuUrl } from '@/settings'
import { getToken } from '@/utils/auth'
import { validateFileDocmentExt,validateFileExt, validatePicExt, validateFileTarExt } from '@/utils/my-validate'
export default {
  name: 'MatchEdit',
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
      headers: {
        Authorization: `bearer ${getToken()}`
      },
      uploadUrl: qiNiuUrl,
      fileList: [],
      files: [],
      fileUrlList: [],
      matchId: '',
      initFlag: false,
      tasks: this.initTasks(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      userRoles: [],
      teacherRoles: [],
      // 上传图片数量限制
      uploadPicLimit: 3,
      // 上传文档数量限制
      uploadDocTarLimit: 1,
      // 超过图片数量限制时隐藏上传组件
      addinvoicehideupload: false,
      editrepairinvoicehideupload: false,
      // 发票上传的数据
      invoiceFiles: [],
      invoiceFileList: [],
      addInvoiceListLength: 0,
      //证书上传的数据
      certificateFiles: [],
      certificateFileList: [],
      addCertificateListLength: 0,
      // 申请书
      applyFileList: [],
      applyFiles: [],
      addApplyListLength: 0,
      // 保存图片地址
      fileUrlList: [],
      invoiceFileUrlList: [],
      certificateFileUrlList: [],
      applyFileUrlList: [],
      // 保存预览图片路径
      previewPath: '',
      //预览窗口显示与影藏
      previewVisible: false,
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20', trigger: 'blur' }],
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' },
        cost: [
            {required: true, message: this.$t('rules.require'), trigger: 'blur'},
            {type: 'number', message: '金额必须为数字值'}]
      },
      team: {
        reliable: '',
        member: [],
        teacher: []
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
    this.initUserRoles()
    window.onresize = () => {
      return (() => {
        this.width = this.initWidth()
      })()
    }
  },
  methods: {
    initTasks() {
      return {
        matchId: '',
        title: '',
        sponsor: '',
        type: 1,
        level: 1,
        applicationForm: '',
        state: 1,
        invoice: '',
        reimbursement: 0,
        time: '',
        cost: 0.0,
        certificate: '',
        rankCode: 6,
        userId: '',
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
    initUserRoles() {
      // 获取老师角色
      this.$get(`system/user/queryUserByNoteIds`,{
        noteIds: '1'
      }).then((r) => {
        console.log(1, r)
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
        console.log(12, r);
      })
      // 获取成员和负责人
      this.$get(`system/user/queryUserByNoteIds`,{
        noteIds: '2,3,4'
      }).then((r) => {
        console.log(1, r)
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
        console.log(12, r);
      })
    },
    setTasks(val) {
      // 获得数据
      // 浅克隆，同一源里的数值也会改变
      // this.tasks = row;
      this.tasks = Object.assign({}, val)
      this.team.reliable = val.reliable
      this.team.member = val.member
      this.team.teacher = val.teacher
      if (this.tasks.invoice.length > 1) {
        this.invoiceFileUrlList = this.tasks.invoice.split(',')
      } else {
        this.invoiceFileUrlList = this.tasks.invoice
      }
      for (var i = 0; i < this.invoiceFileUrlList.length; i++) {
        var fileurl = this.invoiceFileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.invoiceFileList.push({
            name: fileurl.substring(28),
            url: fileurl
          })
        }
      }
      if (this.tasks.certificate.length > 1) {
        this.certificateFileUrlList = this.tasks.certificate.split(',')
      } else {
        this.certificateFileUrlList = this.tasks.certificate
      }
      for (var i = 0; i < this.certificateFileUrlList.length; i++) {
        var fileurl = this.certificateFileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.certificateFileList.push({
            name: fileurl.substring(28),
            url: fileurl
          })
        }
      }
      if (this.tasks.applicationForm.length > 1) {
        this.applyFileUrlList = this.tasks.applicationForm.split(',')
      } else {
        this.applyFileUrlList = this.tasks.applicationForm
      }
      for (var i = 0; i < this.applyFileUrlList.length; i++) {
        var fileurl = this.applyFileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.applyFileList.push({
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
    handleSuccessApply(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.applicationForm === '' || this.tasks.applicationForm === null) {
        this.tasks.applicationForm = response.data.url
      } else {
        this.tasks.applicationForm = this.tasks.applicationForm + ',' + response.data.url
      }
    },
    handleBeforeUploadApply(file) {
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
    handleBeforeRemove(file, fileList) {
     let fileUrl = ''
      let flag = false
      // 添加
      if (this.title === '新增') {
         fileUrl = file.response.data.url
         flag = true
       } else {
         // 修改
         fileUrl = file.url
       }
      console.log(file,this.applyFileList)
      if(flag) this.addApply(fileUrl, file)
      else this.updateApply(file)
    },
    addApply(fileUrl, file) {
      for (let j = 0; j < this.applyFiles.length; j++) {
        if (this.applyFiles[j].uid === file.uid) {
          this.$delete(`oss/content/${this.applyFiles[j].id}`)
          // 根据图片数量分别执行删除的功能
          if (this.applyFiles.length === 1) {
            console.log('111')
            this.tasks.applicationForm = ''
          } else if (this.applyFiles.length === 2) {
            console.log('222');
            if (j === 0) {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                fileUrl + ','
              )[1]
            } else {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                ',' + fileUrl
              )[0]
            }
          } else {
            if (j === 0) {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                fileUrl + ','
              )[1];
            } else if (j === 1) {
              const firsturl = this.tasks.applicationForm.split(',' + fileUrl)[0]
              const lasturl = this.tasks.applicationForm.split(',' + fileUrl)[1]
              this.tasks.applicationForm = firsturl + lasturl
            } else {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                ',' + fileUrl
              )[0]
            }
          }
          this.addApplyListLength--;
          console.log(this.addApplyListLength)
          return true
        }
      }
    },
    updateApply(file) {
      for (let n = 0; n < this.applyFileList.length; n++) {
        if (this.applyFileList[n].uid === file.uid) {
          const fileUrl = this.applyFileList[n].url;
          const fileName = this.applyFileList[n].url
            .substring(28)
            .split('.')[0];
          this.$delete(`oss/content`, { fileName: fileName });
          // 根据图片数量分别执行删除的功能
          if (this.applyFileList.length === 1) {
            console.log('111');
            this.tasks.applicationForm = '';
            this.applyFileList = [];
          } else if (this.applyFileList.length === 2) {
            console.log('222');
            if (n === 0) {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                fileUrl + ','
              )[1];
              this.applyFileList.shift();
            } else {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                ',' + fileUrl
              )[0];
              this.applyFileList.pop();
            }
          } else {
            if (n === 0) {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                fileUrl + ','
              )[1];
              this.applyFileList.shift();
            } else if (n === 1) {
              const firsturl = this.tasks.applicationForm.split(',' + fileUrl)[0];
              const lasturl = this.tasks.applicationForm.split(',' + fileUrl)[1];
              this.tasks.applicationForm = firsturl + lasturl;
              this.applyFileList.splice(n, 1);
            } else {
              this.tasks.applicationForm = this.tasks.applicationForm.split(
                ',' + fileUrl
              )[0];
              this.applyFileList.pop();
            }
          }
          this.addapplyListLength--;
          return true;
        }
      }
    },
    handleBeforeUploadCertificate(file) {
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
    handleSuccessCertificate(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.certificate === '' || this.tasks.certificate === null) {
        this.tasks.certificate = response.data.url
      } else {
        this.tasks.certificate = this.tasks.certificate + ',' + response.data.url
      }
    },
    // 删除添加表单上传的发票图片，写死的（图片长度限定为3）
    addCertificateBeforeRemove (file, fileList) {
      let fileUrl = ''
      let flag = false
      // 添加
      if (this.title === '新增') {
         fileUrl = file.response.data.url
         flag = true
       } else {
         // 修改
         fileUrl = file.url
       }
      console.log(file,this.certificateFileList)
      if(flag) this.addCertificate(fileUrl, file)
      else this.updateCertificate(file)
       
    },
    addCertificate(fileUrl, file) {
      for (let j = 0; j < this.certificateFiles.length; j++) {
        if (this.certificateFiles[j].uid === file.uid) {
          this.$delete(`oss/content/${this.certificateFiles[j].id}`)
          // 根据图片数量分别执行删除的功能
          if (this.certificateFiles.length === 1) {
            console.log('111')
            this.tasks.certificate = ''
          } else if (this.certificateFiles.length === 2) {
            console.log('222');
            if (j === 0) {
              this.tasks.certificate = this.tasks.certificate.split(
                fileUrl + ','
              )[1]
            } else {
              this.tasks.certificate = this.tasks.certificate.split(
                ',' + fileUrl
              )[0]
            }
          } else {
            if (j === 0) {
              this.tasks.certificate = this.tasks.certificate.split(
                fileUrl + ','
              )[1];
            } else if (j === 1) {
              const firsturl = this.tasks.certificate.split(',' + fileUrl)[0]
              const lasturl = this.tasks.certificate.split(',' + fileUrl)[1]
              this.tasks.certificate = firsturl + lasturl
            } else {
              this.tasks.certificate = this.tasks.certificate.split(
                ',' + fileUrl
              )[0]
            }
          }
          this.addCertificateListLength--;
          console.log(this.addCertificateListLength)
          return true
        }
      }
    },
    updateCertificate(file) {
      for (let n = 0; n < this.certificateFileList.length; n++) {
        if (this.certificateFileList[n].uid === file.uid) {
          const fileUrl = this.certificateFileList[n].url;
          const fileName = this.certificateFileList[n].url
            .substring(28)
            .split('.')[0];
          this.$delete(`oss/content`, { fileName: fileName });
          // 根据图片数量分别执行删除的功能
          if (this.certificateFileList.length === 1) {
            console.log('111');
            this.tasks.certificate = '';
            this.certificateFileList = [];
          } else if (this.certificateFileList.length === 2) {
            console.log('222');
            if (n === 0) {
              this.tasks.certificate = this.tasks.certificate.split(
                fileUrl + ','
              )[1];
              this.certificateFileList.shift();
            } else {
              this.tasks.certificate = this.tasks.certificate.split(
                ',' + fileUrl
              )[0];
              this.certificateFileList.pop();
            }
          } else {
            if (n === 0) {
              this.tasks.certificate = this.tasks.certificate.split(
                fileUrl + ','
              )[1];
              this.certificateFileList.shift();
            } else if (n === 1) {
              const firsturl = this.tasks.certificate.split(',' + fileUrl)[0];
              const lasturl = this.tasks.certificate.split(',' + fileUrl)[1];
              this.tasks.certificate = firsturl + lasturl;
              this.certificateFileList.splice(n, 1);
            } else {
              this.tasks.certificate = this.tasks.certificate.split(
                ',' + fileUrl
              )[0];
              this.certificateFileList.pop();
            }
          }
          this.addCertificateListLength--;
          return true;
        }
      }
    },
    handleSuccessInvoice(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.invoice === '' || this.tasks.invoice === null) {
        this.tasks.invoice = response.data.url
      } else {
        this.tasks.invoice = this.tasks.invoice + ',' + response.data.url
      }
    },
    // 删除添加表单上传的发票图片，写死的（图片长度限定为3）
    addInvoiceBeforeRemove (file, fileList) {
      let fileUrl = ''
      let flag = false
      // 添加
      if (this.title === '新增') {
         fileUrl = file.response.data.url
         flag = true
       } else {
         // 修改
         fileUrl = file.url
       }
      console.log(file,this.invoiceFileList)
      if(flag) this.addInvoice(fileUrl, file)
      else this.updateInvoice(file)
       
    },
    addInvoice(fileUrl, file) {
      for (let j = 0; j < this.invoiceFiles.length; j++) {
        if (this.invoiceFiles[j].uid === file.uid) {
          this.$delete(`oss/content/${this.invoiceFiles[j].id}`)
          // 根据图片数量分别执行删除的功能
          if (this.invoiceFiles.length === 1) {
            console.log('111')
            this.tasks.invoice = ''
          } else if (this.invoiceFiles.length === 2) {
            console.log('222');
            if (j === 0) {
              this.tasks.invoice = this.tasks.invoice.split(
                fileUrl + ','
              )[1]
            } else {
              this.tasks.invoice = this.tasks.invoice.split(
                ',' + fileUrl
              )[0]
            }
          } else {
            if (j === 0) {
              this.tasks.invoice = this.tasks.invoice.split(
                fileUrl + ','
              )[1];
            } else if (j === 1) {
              const firsturl = this.tasks.invoice.split(',' + fileUrl)[0]
              const lasturl = this.tasks.invoice.split(',' + fileUrl)[1]
              this.tasks.invoice = firsturl + lasturl
            } else {
              this.tasks.invoice = this.tasks.invoice.split(
                ',' + fileUrl
              )[0]
            }
          }
          this.addInvoiceListLength--;
          console.log(this.addInvoiceListLength)
          // this.addInvoiceChange();
          return true
        }
      }
    },
    updateInvoice(file) {
      for (let n = 0; n < this.invoiceFileList.length; n++) {
        if (this.invoiceFileList[n].uid === file.uid) {
          const fileUrl = this.invoiceFileList[n].url;
          const fileName = this.invoiceFileList[n].url
            .substring(28)
            .split('.')[0];
          this.$delete(`oss/content`, { fileName: fileName });
          // 根据图片数量分别执行删除的功能
          if (this.invoiceFileList.length === 1) {
            console.log('111');
            this.tasks.invoice = '';
            this.invoiceFileList = [];
          } else if (this.invoiceFileList.length === 2) {
            console.log('222');
            if (n === 0) {
              this.tasks.invoice = this.tasks.invoice.split(
                fileUrl + ','
              )[1];
              this.invoiceFileList.shift();
            } else {
              this.tasks.invoice = this.tasks.invoice.split(
                ',' + fileUrl
              )[0];
              this.invoiceFileList.pop();
            }
          } else {
            if (n === 0) {
              this.tasks.invoice = this.tasks.invoice.split(
                fileUrl + ','
              )[1];
              this.invoiceFileList.shift();
            } else if (n === 1) {
              const firsturl = this.tasks.invoice.split(',' + fileUrl)[0];
              const lasturl = this.tasks.invoice.split(',' + fileUrl)[1];
              this.tasks.invoice = firsturl + lasturl;
              this.invoiceFileList.splice(n, 1);
            } else {
              this.tasks.invoice = this.tasks.invoice.split(
                ',' + fileUrl
              )[0];
              this.invoiceFileList.pop();
            }
          }
          this.addInvoiceListLength--;
          // this.editInvoiceChange();
          return true;
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
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.tasks.matchId) {
            // create
            // 调用getDge
            const tasks = this.tasks
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            this.doSubmit()
            tasks.userId = a
            tasks.m_state = b
            this.$post('studio/match', { ...tasks }).then(() => {
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
            // 调用getDge
            const tasks = this.tasks
            const { a, b, flag } = this.getDge(this.team.reliable, this.team.member, this.team.teacher)
            if (flag) {
              this.buttonLoading = false
              return this.$message.info('不能多次选择同一个人，只能选择一次')
            }
            tasks.userId = a
            tasks.m_state = b
            delete tasks.members
            console.log(22, tasks)
            const updateState = {
              state: tasks.state,
              matchId: tasks.matchId
            }
            this.$put('studio/match/state', { ...updateState })
            this.$put('studio/match', { ...tasks }).then((r) => {
              this.buttonLoading = false
              this.isVisible = false
              this.$message({
                message: this.$t('tips.updateSuccess'),
                type: 'success'
              })
              this.$emit('success')
            })
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
      this.tasks = this.initTasks()
    },
    // 监听发票图片数量是否超过限制，从而隐藏上传框
    addInvoiceChange () {
      this.addinvoicehideupload =
        this.addInvoiceListLength >= this.uploadPicLimit;
    },
    // 刷新上传列表
    doSubmit() {
      this.fileList = []
      this.fileUrlList = []
      this.invoiceFileList = [];
      this.invoiceFiles = [];
      this.certificateFiles = [];
      this.certificateFileList = [];
      this.applyFileList = [];
      this.applyFiles = [];
      this.dialogImageUrl = ''
      this.dialog = false
    },
    // 修改时的图片预览效果
    handlePreview(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    handlePreview1(file) {
      console.log(file)
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 图片预览关闭
    previewDialogClose() {
      this.previewPath = ''
      this.previewVisible = false
    }
  }
}
</script>
<style lang="scss" scoped>
.previewImg {
  width: 100%;
}
</style>
