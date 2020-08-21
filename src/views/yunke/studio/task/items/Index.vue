<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="queryParams.title" placeholder="项目名称" class="filter-item search-item" />
      <el-input v-model="queryParams.chargeFullName" placeholder="负责人" class="filter-item search-item" />
      <el-input v-model="queryParams.teacherFullName" placeholder="指导老师" class="filter-item search-item" />
      <el-date-picker
        start-placeholder="时间段查询"
        v-model="queryParams.timeRange"
        :range-separator="null"
        value-format="yyyy-MM-dd"
        class="filter-item search-item date-range-item"
        type="daterange"
      />
      <br>
     <!-- <el-select  v-model="queryParams.reimbursement"  value="" placeholder="是否已报销">
          <el-option
            v-for="item in whether"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select> -->
      <el-button class="filter-item" type="primary" plain @click="search">
        {{ $t('table.search') }}
      </el-button>
      <el-button class="filter-item" type="warning" plain @click="reset">
        {{ $t('table.reset') }}
      </el-button>
      <el-button class="filter-item" type="success" plain @click="add">
        {{ $t('table.add') }}
      </el-button>
     <!-- <el-dropdown v-has-any-permission="['task:add','task:delete','task:reset','task:export']" trigger="click" class="filter-item">
        <el-button>
          {{ $t('table.more') }}<i class="el-icon-arrow-down el-icon--right" />
        </el-button>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item v-has-permission="['task:delete']" @click.native="batchDelete">{{ $t('table.delete') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:reset']" @click.native="resetPassword">{{ $t('table.resetPassword') }}</el-dropdown-item>
          <el-dropdown-item v-has-permission="['task:export']" @click.native="exportExcel">{{ $t('table.export') }}</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown> -->
    </div>
  <!-- 表格区域 -->
    <el-table
      ref="table"
      :key="tableKey"
      :data="listRows"
      border
      fit
      style="width: 100%;"
      @selection-change="onSelectChange" 
      @sort-change="sortChange"
      @row-click="toogleExpand"
    >
     <el-table-column type="selection" align="center" width="40px" />
      <!-- 项目名称 -->
      <el-table-column  label="项目名称" prop="title"  :show-overflow-tooltip="true" align="center" min-width="95px">
        <template slot-scope="scope">
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
       <!-- 项目摘要 -->
      <el-table-column label="摘要"  :show-overflow-tooltip="true" align="center" min-width="110px">
        <template slot-scope="scope">
          <span>{{ scope.row.introduction }}</span>
        </template>
      </el-table-column>
       <!-- 项目说明书  -->
      <el-table-column  label="项目说明书"  :show-overflow-tooltip="true" align="center" min-width="100px">
       <template slot-scope="scope">
        <el-button v-if="scope.row.specification !== ''" size="mini" type="primary" plain  @click.stop="upload(scope.row.specification)">下载</el-button>
        </template>
      </el-table-column>
      <!-- 项目源文件  -->
      <el-table-column label="源文件"  :show-overflow-tooltip="true" align="center" min-width="100px">
       <template slot-scope="scope">
         <el-button v-if="scope.row.url !==''" size="mini" type="primary" plain  @click.stop="upload(scope.row.url)">下载</el-button>
          <!-- <a class="el-link el-link--primary" v-if="scope.row.url.length > 0" @click.stop="upload(scope.row.url)">{{scope.row.url}}></a> -->
        </template>
      </el-table-column>
      <!-- 项目负责人 -->
      <el-table-column label="负责人"  :show-overflow-tooltip="true" align="center" min-width="86px">
        <template slot-scope="scope">
          <span>{{ scope.row.chargeFullName }}</span>
        </template>
      </el-table-column>
       <!-- 项目指导老师 -->
      <el-table-column label=指导老师  :show-overflow-tooltip="true" align="center" min-width="86px">
        <template slot-scope="scope">
          <span>{{ scope.row.teacherFullName }}</span>
        </template>
      </el-table-column>
      <!-- 项目状态  -->
       <el-table-column
        label="状态"
        :filters="[{ text: '进行中', value: 1 }, { text: '已完成', value: 2 }]"
        :filter-method="filterStatus"
        class-name="status-col"
        >
        <template slot-scope="{row}">
          <el-tag :type="row.state | statusFilter">
            {{ row.state === 1 ? '进行中' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 项目报销情况  -->
       <el-table-column
        min-width="90px"
        label="报销情况"
        :filters="[{ text: '未报销', value: 0 }, { text: '已报销', value: 1 }]"
        :filter-method="filterStatus"
        class-name="status-col"
      >
        <template slot-scope="{row}">
          <el-tag :type="row.reimbursement | whetherFilter">
            {{ row.reimbursement === 1 ? '已报销' : '未报销' }}
          </el-tag>
        </template>
      </el-table-column>
      <!-- 操作 -->
      <el-table-column :label="$t('table.operation')" align="center" min-width="130px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <i v-hasPermission="['task:add']" class="el-icon-coin table-operation" style="color: #87d068;" @click.stop="changeReimbursement(row)" />
          <i v-hasPermission="['task:update']" class="el-icon-setting table-operation" style="color: #2db7f5;" @click.stop="edit(row)" />
          <i v-hasPermission="['task:delete']" class="el-icon-delete table-operation" style="color: #f50;" @click.stop="singleDelete(row)" />
          <i v-hasPermission="['task:view']" class="el-icon-info table-operation" style="color: #909399;" @click.stop="toogleExpand(row)" />
          <el-link v-has-no-permission="['task:add', 'task:view','task:update','task:delete']" class="no-perm">
            {{ $t('tips.noPermission') }}
          </el-link>
        </template>
      </el-table-column>
      <!-- 展开区域 -->
      <el-table-column type="expand" width="1px">
          <template slot-scope="props">
            <el-form label-position="left" class="table-expand">
              <el-form-item label="成员:">
                <span>{{ team.member }}</span>
              </el-form-item>
              <el-form-item label="开始时间:">
                <span>{{ props.row.startTime }}</span>
              </el-form-item>
              <el-form-item label="结束时间:">
                <span>{{ props.row.endTime }}</span>
              </el-form-item>
            </el-form>
            <el-form label-position="left" class="table-expand">
              <el-form-item label="花费:">
                <span>{{ props.row.cost }}</span>
              </el-form-item>
              <el-form-item label="">
                <span></span>
              </el-form-item>
            </el-form>
            <el-form label-position="left" class="table-expand">
              <el-form-item label="发票:">
                <div class="demo-image" v-if="props.row.invoice">
                  <div class="block" v-for="(item, i) in props.row.invoice.split(',')" :key="i">
                    <el-image
                      :src="item"
                      @click="showpreViewDialog(item)">
                      </el-image>
                  </div>
                </div>
              </el-form-item>
            </el-form>
          </template>
        </el-table-column>
   </el-table>
    <pagination v-show="total>0" :total="total" :page.sync="pagination.num" :limit.sync="pagination.size" @pagination="search" />
    <tasks-edit
      ref="edit"
      :dialog-visible="dialog.isVisible"
      :title="dialog.title"
      @success="editSuccess"
      @close="editClose"
    />
    <!-- <tasks-view
      ref="view"
      :dialog-visible="taskViewVisible"
      @close="viewClose"
    /> -->
    <!-- 图片预览 -->
      <el-dialog
        title="图片预览"
        :visible.sync="previewVisible"
        width="40%"
        @close="previewDialogClose"
      >
        <el-image :src="previewPath" alt class="previewImg" />
      </el-dialog>
  </div>
</template>

<script>
import TasksEdit from './Edit'
// import TasksView from './View'
import Pagination from '@/components/Pagination'

export default {
  name: 'TaskItems',
  components: { Pagination, TasksEdit },
  filters: {
    statusFilter(status) {
      const map = {
        1: 'warning',
        2: 'success'
      }
      return map[status]
    },
    whetherFilter(status) {
      const map = {
        0: 'warning',
        1: 'success'
      }
      return map[status]
    }
  },
  data() {
    return {
      dialog: {
        isVisible: false,
        title: ''
      },
      // taskViewVisible: false,
      queryParams: {},
      tableKey: 0,
      total: 0,
      pagination: {
        size: 10,
        num: 1
      },
      sort: {},
      selection: [],
      // 论文项目数据
      listRows: [],
      // whether: [{
      //   id: 0,
      //   name: '未报销'
      // },
      // {
      //   id: 1,
      //   name: '已报销'
      // }
      // ],
      newWin: null,
      // 申请报销所需的资金对象
      Funding: {
        name: '',
        applyTime: '',
        proposerId: 0
      },
      // 保存预览图片路径
      previewPath: '',
      // 图片预览窗口的显示与隐藏
      previewVisible: false,
      // 保存负责人，成员，指导老师
      team: {
        reliable: '',
        member: '',
        teacher: ''
      },
      url: ''
    }
  },
  computed: {
    currentUser() {
      return this.$store.state.account.user
    }
  },
  created() {
    this.fetch()
    console.log(this.$route.params.Tasks)
  },
  watch: {
    url(newVal, oldVal) {
      if (newVal && this.newWin) {
        this.newWin.sessionStorage.clear()
        this.newWin.location.href = newVal
        this.url = ''
        this.newWin = null
      }
    }
  },
  methods: {
    add() {
      this.dialog.title = this.$t('common.add')
      this.dialog.isVisible = true
    },
    editClose() {
      this.dialog.isVisible = false
    },
    editSuccess() {
      this.search()
    },
    onSelectChange(selection) {
      this.selection = selection
    },
    search() {
      this.fetch({
        ...this.queryParams,
        ...this.sort
      })
    },
    reset() {
      this.queryParams = {}
      this.sort = {}
      this.$refs.table.clearSort()
      this.$refs.table.clearFilter()
      this.search()
    },
    singleDelete(row) {
      this.$refs.table.toggleRowSelection(row, true)
      this.batchDelete()
    },
    batchDelete() {
      if (!this.selection.length) {
        this.$message({
          message: this.$t('tips.noDataSelected'),
          type: 'warning'
        })
        return
      }
      let contain = false
      this.$confirm(this.$t('tips.confirmDelete'), this.$t('common.tips'), {
        confirmButtonText: this.$t('common.confirm'),
        cancelButtonText: this.$t('common.cancel'),
        type: 'warning'
      }).then(() => {
        const itemsId = []
        this.selection.forEach((u) => {
          // 不能删除自己xxx
          if (u.itemsId === this.currentUser.itemsId) {
            contain = true
            return
          }
          itemsId.push(u.itemsId)
        })
        if (contain) {
          this.$message({
            message: this.$t('tips.containCurrentUser'),
            type: 'warning'
          })
          this.clearSelections()
        } else {
          this.delete(itemsId)
        }
      }).catch(() => {
        this.clearSelections()
      })
    },
    delete(itemsIds) {
      this.loading = true
      this.$delete(`studio/items/${itemsIds}`).then(() => {
        this.$message({
          message: this.$t('tips.deleteSuccess'),
          type: 'success'
        })
        this.search()
      })
    },
    clearSelections() {
      this.$refs.table.clearSelection()
    },
    // view(row) {
    //   this.$get(`studio/items/${row.itemsId}`).then((r) => {
    //     const uResult = []
    //     const data = r.data.data
    //     let userId = []
    //     let userState = []
    //     if (data.userId && typeof data.userId === 'string') {
    //       userId = data.userId.split(',')
    //     }
    //     if (data.userState && typeof data.userState === 'string') {
    //       userState = data.userState.split(',')
    //     }
    //     // 拿到uesrId及名称
    //     this.$get('system/user').then((r) => {
    //       const rows = r.data.data.rows
    //       rows.forEach((v, i) => {
    //         userId.forEach((v1, i1) => {
    //           if (v1 === ('' + v.userId)) {
    //             uResult.push(v.fullName)
    //           }
    //         })
    //       })
    //       let reliable = ''
    //       let member = ''
    //       let teacher = ''
    //       userState.forEach((v1, i1) => {
    //         if (v1 === '1') {
    //           if (reliable === '') {
    //             reliable = uResult[i1]
    //           } else {
    //             reliable += ',' + uResult[i1]
    //           }
    //         }
    //         if (v1 === '2') {
    //           if (member === '') {
    //             member = uResult[i1]
    //           } else {
    //             member += ',' + uResult[i1]
    //           }
    //         }
    //         if (v1 === '3') {
    //           if (teacher === '') {
    //             teacher = uResult[i1]
    //           } else {
    //             teacher += ',' + uResult[i1]
    //           }
    //         }
    //       })
    //       this.team = {
    //         reliable,
    //         member,
    //         teacher
    //       }
    //     })
    //   })
    // },
    edit(row) {
      // 已完成的任务无法修改
      if (parseInt(row.state) === 2) {
        return this.$message.info('任务已完成无法修改！')
      }
      // 管理员权限  任务负责人权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或任务负责人操作！')
      }
      let userId = row.members
      let reliable = ''
      const member = []
      const teacher = []
      userId.forEach((v1, i1) => {
        if (v1.state === 1) {
          reliable = '' + v1.userId
        }
        if (v1.state === 2) {
          member.push('' + v1.userId)
        }
        if (v1.state === 3) {
          teacher.push('' + v1.userId)
        }
      })
      row.reliable = reliable
      row.member = member
      row.teacher = teacher
      this.$refs.edit.setTasks(row)
      this.dialog.title = this.$t('common.edit')
      this.dialog.isVisible = true
      // this.$get(`studio/items/${row.itemsId}`).then((r) => {
      //   const data = r.data.data
      //   let userId = []
      //   let userState = []
      //   if (data.userId && typeof data.userId === 'string') {
      //     userId = data.userId.split(',')
      //   }
      //   if (data.userState && typeof data.userState === 'string') {
      //     userState = data.userState.split(',')
      //   }
      //   let reliable = ''
      //   let member = ''
      //   let teacher = ''
      //   userState.forEach((v1, i1) => {
      //     if (v1 === '1') {
      //       if (reliable === '') {
      //         reliable = userId[i1]
      //       } else {
      //         reliable += ',' + userId[i1]
      //       }
      //     }
      //     if (v1 === '2') {
      //       if (member === '') {
      //         member = userId[i1]
      //       } else {
      //         member += ',' + userId[i1]
      //       }
      //     }
      //     if (v1 === '3') {
      //       if (teacher === '') {
      //         teacher = userId[i1]
      //       } else {
      //         teacher += ',' + userId[i1]
      //       }
      //     }
      //   })
      //   row.reliable = reliable
      //   row.member = member === '' ? [] : member.split(',')
      //   row.teacher = teacher === '' ? [] : teacher.split(',')
      //   console.log(row)
      //   this.$refs.edit.setTasks(row)
      //   this.dialog.title = this.$t('common.edit')
      //   this.dialog.isVisible = true
      // })
    },
    upload(url) {
      this.newWin = window.open()
      this.url = url
    },
    fetch(params = {}) {
      params.pageSize = this.pagination.size
      params.pageNum = this.pagination.num
      if (this.queryParams.timeRange) {
        params.startTime = this.queryParams.timeRange[0]
        params.endTime = this.queryParams.timeRange[1]
      }
      this.loading = true
      this.$get('studio/items', {
        ...params
      }).then((r) => {
        console.log(r)
        const data = r.data.data
        this.total = data.total
        this.TakeTeams(data.rows)
        this.loading = false
      })
    },
    // 转换负责人。成员。指导老师
    TakeTeams(listRows) {
      listRows.forEach((v, i) => {
        if (v.invoice === null) {
          v.invoice = ''
        }
        v.members.forEach((v1, i1) => {
          if (v1.state === 1) {
            v.chargeFullName = v1.fullName
          }
          if (v1.state === 3) {
            v.teacherFullName = v1.fullName
          }
          if (v1.state === 2) {
            if (v.memberFullName === undefined) {
              v.memberFullName = v1.fullName
            } else {
              v.memberFullName += ',' + v1.fullName
            }
          }
        })
      })
      this.listRows = listRows
    },
    handleClose() {
      this.inVoiceDialogVisible = false
    },
    sortChange(val) {
      console.log(val)
      this.sort.field = val.prop
      this.sort.order = val.order
      this.search()
    },
    filterStatus(value, row) {
      return row.status === value
    },
    // 弹出申请报销对话框
    async changeReimbursement(row) {
      // 管理员权限  任务负责人权限
      let flag = this.currentUser.roleId.indexOf('1') === -1
      const fg = row.chargeFullName !== this.currentUser.fullName
      if (!flag || !fg) {
        flag = false
      }
      if (flag) {
        return this.$message.info('仅允许管理员或任务负责人操作！')
      }
      // 检查是否已报销
      if (row.reimbursement === 1) {
        return this.$message.info('该项目任务已经报销！')
      }
      // 符合条件，弹出申请报销对话框
      // this.reimbursementDialogVisible = true
      const confirmResult = await this.$confirm(
        '您的报销条件已符合, 是否确认报销?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了报销')
      }
      this.Funding.applyTime = this.getTime()
      this.Funding.proposerId = this.currentUser.userId
      this.Funding.name = row.title + '项目任务报销'
      this.Funding.type = 'items'
      this.Funding.id = row.itemsId
      console.log(this.Funding)
      this.$router.push({
        name: '经费管理',
        params: {
          Funding: this.Funding
        }
      })
      // this.$get(`studio/items/${row.itemsId}`).then(async(r) => {
      //   const data = r.data.data
      //   const userId = data.userId || ''
      //   // 管理员权限  任务负责人权限
      //   let flag = this.currentUser.roleId.indexOf('1') === -1
      //   const fg = userId.indexOf(this.currentUser.userId) !== 0
      //   if (!flag || !fg) {
      //     flag = false
      //   }
      //   if (flag) {
      //     return this.$message.info('仅允许管理员或任务负责人操作！')
      //   }
      //   // 检查是否已报销
      //   if (row.reimbursement === 1) {
      //     return this.$message.info('该项目任务已经报销！')
      //   }
      //   // 符合条件，弹出申请报销对话框
      //   // this.reimbursementDialogVisible = true
      //   const confirmResult = await this.$confirm(
      //     '您的报销条件已符合, 是否确认报销?',
      //     '提示',
      //     {
      //       confirmButtonText: '确定',
      //       cancelButtonText: '取消',
      //       type: 'warning'
      //     }
      //   ).catch((err) => err)
      //   if (confirmResult !== 'confirm') {
      //     return this.$message.info('取消了报销')
      //   }
      //   this.Funding.applyTime = this.getTime()
      //   this.Funding.proposerId = this.currentUser.userId
      //   this.Funding.name = row.title + '项目任务报销'
      //   this.Funding.type = 'items'
      //   this.Funding.type = row.itemsId
      //   console.log(this.Funding)
      //   this.$router.push({
      //     name: '经费管理',
      //     params: {
      //       Funding: this.Funding
      //     }
      //   })
      // })
    },
    // 获取时间
    getTime: function() {
      var _this = this
      const yy = new Date().getFullYear()
      const mm =
        new Date().getMonth() + 1 < 10
          ? '0' + (new Date().getMonth() + 1)
          : new Date().getMonth() + 1
      const dd =
        new Date().getDate() < 10
          ? '0' + new Date().getDate()
          : new Date().getDate()
      _this.nowDate = yy + '-' + mm + '-' + dd
      return _this.nowDate
    },
    // 手风琴效果
    async toogleExpand(row) {
      this.team.member = row.memberFullName
      const $table = this.$refs.table
      this.listRows.map((item) => {
        if (row.itemsId !== item.itemsId) {
          $table.toggleRowExpansion(item, false)
        }
      })
      $table.toggleRowExpansion(row)
    },
    // 处理图片预览效果
    handlePreview(file) {
      if ('url' in file) {
        this.previewPath = file.url
      } else {
        this.previewPath = file.response.data.url
      }
      this.previewVisible = true
    },
    // 查看发票图片
    showpreViewDialog(item) {
      this.previewPath = item
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
.table-expand {
  font-size: 0;
}
.table-expand label {
  width: 90px;
  color: #99a9bf;
}
.table-expand .el-form-item {
  margin-right: 0;
  margin-bottom: 0;
  width: 100%;
}
.invoiceUl {
  list-style: none;
  margin: 0;
}
.invoiceUl .invoiceLi {
  cursor: pointer;
}
.table-expand[data-v-7ec7feb6] {
  display: flex;
}
.demo-image {
  display: flex;
}
.demo-image .el-image {
  width: 100px;
  height: 100px;
  margin: 0px 10px;
  border:  1px solid #000;
}
.el-button {
  margin-right: 0px;
}
</style>
