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
            <!-- 发表时间 -->
            <el-form-item label="发表时间:" prop="publishTime">
              <el-date-picker
                v-model="tasks.publishTime"
                type="date"
                placeholder="选择日期"
                align="right"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>
            <!-- 论文标题 -->
            <el-form-item label="论文标题:" prop="title">
                <el-input v-model="tasks.title"  />
            </el-form-item>
            <!-- 期刊名称 -->
            <el-form-item label="期刊名称:" prop="introduction">
                <el-input v-model="tasks.introduction"  />
            </el-form-item>
            <!-- 刊号 -->
            <el-form-item label="刊号:" prop="issue">
              <el-input v-model="tasks.issue"  />
            </el-form-item>
            <!-- 类型 -->
            <el-form-item label="类型" prop="paperType">
                <el-radio-group v-model="tasks.paperType">
                    <el-radio :label='1'>核心</el-radio>
                    <el-radio :label='2'>普通</el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- 作者 -->
            <el-form-item label="作者:" >
              <el-select v-model="team.reliable"  value="" placeholder="作者" style="width:100%">
                <el-option
                  v-for="thesis in userRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item>
            <!-- 成员 -->
            <el-form-item label="成员" >
              <el-select v-model="team.member" filterable allow-create multiple value="" placeholder="成员(不包括负责人)" style="width:100%">
                <el-option
                  v-for="thesis in userRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item>
            <!-- 指导老师 -->
            <el-form-item label="指导老师:" >
              <el-select v-model="team.teacher" filterable allow-create default-first-option multiple value="" placeholder="指导老师" style="width:100%">
                <el-option
                  v-for="thesis in teacherRoles"
                  :key="thesis.userId"
                  :label="thesis.fullName"
                  :value="String(thesis.userId)"
                />
              </el-select>
            </el-form-item>
            <!-- 花费 -->
            <el-form-item label="花费:" prop="cost">
                <el-input v-model.number="tasks.cost"  />
            </el-form-item>
            <!-- 状态 -->
            <el-form-item label="状态:" prop="state">
                <el-radio-group v-model="tasks.state">
                    <el-radio :label='1'>进行中</el-radio>
                    <el-radio :label='2'>已完成</el-radio>
                </el-radio-group>
            </el-form-item>
            <!-- 报销情况 -->
            <el-form-item label="报销情况" prop="reimbursement">
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
                :file-list="invoiceFileList"
                :action="uploadUrl"
                accept=".jpg,.jpeg,.png,.gif,.bmp"
                :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
                :headers="headers"
                multiple
                :limit="uploadPicLimit"
                list-type="picture-card"
                drag
              >
                <i class="el-icon-upload" />
                <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，可同时上传<b>3张发票</b>，且文件不超过5M</div>
              </el-upload>
            </el-form-item>
            <!-- 上传论文 -->
            <el-form-item label="上传论文:" prop="url">
              <el-upload
                :before-upload="handleBeforeUploadUrl"
                :before-remove="handleBeforeRemove"
                :on-success="handleSuccessUrl"
                :file-list="urlFileList"
                :action="uploadUrl"
                class="upload-demo"
                :headers="headers"
                multiple
                accept=".doc,.docx,.pdf,.ppt"
                :class="{hideupload:editrepairinvoicehideupload, picturecard:true}"
                :limit="uploadDocTarLimit"
                drag
              >
                <i class="el-icon-upload" />
                <div slot="tip" style="display: block;" class="el-upload__tip">请勿上传违法文件，<b>只能上传 1 个附件</b>，且文件不超过5M</div>
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
import { validateFileDocmentExt, validateFileExt, validatePicExt, validateFileTarExt } from '@/utils/my-validate'
export default {
  name: 'ThesisEdit',
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
      thesisId: '',
      initFlag: false,
      tasks: this.initTasks(),
      buttonLoading: false,
      screenWidth: 0,
      width: this.initWidth(),
      userRoles: [],
      teacherRoles: [],
      // 保存预览图片路径
      previewPath: '',
      // 上传图片数量限制
      uploadPicLimit: 3,
      // 上传文档和压缩包数量限制
      uploadDocTarLimit: 1,
  	  // 超过图片数量限制时隐藏上传组件
      editrepairinvoicehideupload: false,
      // 发票上传的数据
      invoiceFiles: [],
      invoiceFileList: [],
      addInvoiceListLength: 0,
      // 论文上传的数据
      urlFiles: [],
      urlFileList: [],
      addUrlListLength: 0,
      // 保存图片地址
      fileUrlList: [],
      invoiceFileUrlList: [],
      urlFileUrlList: [],
      // 保存预览图片路径
      previewPath: '',
      //预览窗口显示与影藏
      previewVisible: false,
      rules: {
        title: [
          { required: true, message: this.$t('rules.require'), trigger: 'blur' },
          { min: 2, max: 20, message: '长度为2-20', trigger: 'blur' }],
        state: { required: true, message: this.$t('rules.require'), trigger: 'blur' }
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
        thesisId: '',
        publishTime: '',
        title: '',
        issue: '',
        introduction: '',
        paperType: 2,
        url: '',
        cost: 0.0,
        state: 1,
        invoice: '',
        reimbursement: 0,
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
      this.$get('system/user').then((r) => {
        console.log(11, r)
        const userRoles = []
        const teacherRoles = []
        const rows = r.data.data.rows
        rows.forEach((v, i) => {
          const obj = {
            userId: v.userId,
            fullName: v.fullName
          }
          if (v.noteId === '1') teacherRoles.push(obj)
          else if (v.noteId === '2' || v.noteId === '3') userRoles.push(obj)
        })
        this.userRoles = userRoles
        this.teacherRoles = teacherRoles
      }).catch((error) => {
        console.error(error)
        this.$message({
          message: this.$t('tips.getDataFail'),
          type: 'error'
        })
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
      if (this.tasks.url.length > 1) {
        this.urlFileUrlList = this.tasks.url.split(',')
      } else {
        this.urlFileUrlList = this.tasks.url
      }
      for (var i = 0; i < this.urlFileUrlList.length; i++) {
        var fileurl = this.urlFileUrlList[i]
        if (fileurl !== null || fileurl !== '') {
          this.urlFileList.push({
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
    // 发票
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
    // 发票上传校验
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
    // 论文
    handleSuccessUrl(response, file, fileList) {
      const uid = file.uid
      const id = response.data.contentId
      this.files.push({ uid, id })
      if (this.tasks.url === '' || this.tasks.url === null) {
        this.tasks.url = response.data.url
      } else {
        this.tasks.url = this.tasks.url + ',' + response.data.url
      }
    },
    // 论文上传验证
    handleBeforeUploadUrl(file) {
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
      console.log(file,this.urlFileList)
      if(flag) this.addUrl(fileUrl, file)
      else this.updateUrl(file)
    },
    addUrl(fileUrl, file) {
      for (let j = 0; j < this.urlFiles.length; j++) {
        if (this.urlFiles[j].uid === file.uid) {
          this.$delete(`oss/content/${this.urlFiles[j].id}`)
          // 根据图片数量分别执行删除的功能
          if (this.urlFiles.length === 1) {
            console.log('111')
            this.tasks.url = ''
          } else if (this.urlFiles.length === 2) {
            console.log('222');
            if (j === 0) {
              this.tasks.url = this.tasks.url.split(
                fileUrl + ','
              )[1]
            } else {
              this.tasks.url = this.tasks.url.split(
                ',' + fileUrl
              )[0]
            }
          } else {
            if (j === 0) {
              this.tasks.url = this.tasks.url.split(
                fileUrl + ','
              )[1];
            } else if (j === 1) {
              const firsturl = this.tasks.url.split(',' + fileUrl)[0]
              const lasturl = this.tasks.url.split(',' + fileUrl)[1]
              this.tasks.url = firsturl + lasturl
            } else {
              this.tasks.url = this.tasks.url.split(
                ',' + fileUrl
              )[0]
            }
          }
          this.addUrlListLength--;
          console.log(this.addUrlListLength)
          return true
        }
      }
    },
    updateUrl(file) {
      for (let n = 0; n < this.urlFileList.length; n++) {
        if (this.urlFileList[n].uid === file.uid) {
          const fileUrl = this.urlFileList[n].url;
          const fileName = this.urlFileList[n].url
            .substring(28)
            .split('.')[0];
          this.$delete(`oss/content`, { fileName: fileName });
          // 根据图片数量分别执行删除的功能
          if (this.urlFileList.length === 1) {
            console.log('111');
            this.tasks.url = '';
            this.urlFileList = [];
          } else if (this.urlFileList.length === 2) {
            console.log('222');
            if (n === 0) {
              this.tasks.url = this.tasks.url.split(
                fileUrl + ','
              )[1];
              this.urlFileList.shift();
            } else {
              this.tasks.url = this.tasks.url.split(
                ',' + fileUrl
              )[0];
              this.urlFileList.pop();
            }
          } else {
            if (n === 0) {
              this.tasks.url = this.tasks.url.split(
                fileUrl + ','
              )[1];
              this.urlFileList.shift();
            } else if (n === 1) {
              const firsturl = this.tasks.url.split(',' + fileUrl)[0];
              const lasturl = this.tasks.url.split(',' + fileUrl)[1];
              this.tasks.url = firsturl + lasturl;
              this.urlFileList.splice(n, 1);
            } else {
              this.tasks.url = this.tasks.url.split(
                ',' + fileUrl
              )[0];
              this.urlFileList.pop();
            }
          }
          this.addUrlListLength--;
          return true;
        }
      }
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.buttonLoading = true
          if (!this.tasks.thesisId) {
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
            this.$post('studio/thesis', { ...tasks }).then(() => {
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
              thesisId: tasks.thesisId
            }
            this.$put('studio/thesis/state', { ...updateState })
            this.$put('studio/thesis', { ...tasks }).then((r) => {
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
      if (reliable.length > 0) {
        reliableArr.push('1')
      }
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
      a= a.join(',')
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
    // 刷新上传列表
    doSubmit() {
      this.fileList = []
      this.fileUrlList = []
      this.invoiceFileList = [];
      this.invoiceFiles = [];
      this.urlFiles = [];
      this.urlFileList = [];
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
