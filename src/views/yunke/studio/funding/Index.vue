<template>
  <div class="app-container">
    <div class="filter-container">
      <!-- 状态码 -->
      <el-select v-model="funding.state" placeholder="状态" style="width: 110px" class="filter-item">
        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>

      <!-- 时间 -->
      <el-date-picker v-model="funding.applyTime" type="datetimerange" range-separator="-" start-placeholder="开始日期"
        end-placeholder="结束日期" class="filter-item" style="width:240px">
      </el-date-picker>

      <!-- 报销名称 -->
      <el-input v-model="funding.name" placeholder="请输入报销名称" style="width:200px" class="filter-item"></el-input>

      <!-- 申请人 -->
      <el-autocomplete popper-class="my-autocomplete" v-model="verifierName" :fetch-suggestions="querySearch"
        placeholder="请选择申请人" @select="handleSelect1" style="width: 155px" class="filter-item">
        <template slot-scope="{ item }">
          <div class="name">{{ item.value }} <span class="id">{{ item.id }}</span></div>
        </template>
      </el-autocomplete>
      <!-- 审核人 -->
      <el-autocomplete popper-class="my-autocomplete" v-model="proposerName" :fetch-suggestions="querySearch"
        placeholder="请选择审核人" @select="handleSelect2" style="width: 155px" class="filter-item">
        <template slot-scope="{ item }">
          <div class="name">{{ item.value }} <span class="id">{{ item.id }}</span></div>
        </template>
      </el-autocomplete>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleSearch">
        搜索
      </el-button>
      <el-button class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        添加
      </el-button>

      <!-- <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">
        下载
      </el-button> -->


      <!-- 查询结果 -->
      <el-table :data="tableData" tooltip-effect="dark" style="width:100%" border>
        <el-table-column type="selection" width="40">
        </el-table-column>
        <!-- <el-table :data="tableData" tooltip-effect="dark" style="width:100%" @selection-change="handleSelectionChange"
        border> -->
        <el-table-column label="报销名称" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申报状态" align="center"
          :filters="[{ text: '申请中', value: '1' }, { text: '报销中', value: '2' },{ text: '报销成功', value: '3' },{ text: '申请失败', value: '4' }]"
          :filter-method="filterBXStatus" filter-placement="bottom-end">

          <template slot-scope="scope">
            <el-tag :type="scope.row.state | BXStatusFilter" style="margin-left: 10px">{{ scope.row.stateText }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.applyTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="申请人" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.proposerName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="审核人" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.verifierName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="报销金额" align="center">
          <template slot-scope="scope">
            <span style="margin-left: 10px">{{ scope.row.cost }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="150px" class-name="small-padding fixed-width">
          <template slot-scope="scope">
            <i class="el-icon-edit table-operation" style="color: #87d068;" @click="handleUpdate(scope.row)"></i>
            <i class="el-icon-delete table-operation" style="color: #f50;"
              @click="handleDelete(scope.$index, scope.row)"></i>
            <i class="el-icon-check table-operation" style="color: #2db7f5;" v-if="handleJudge(scope.$index, scope.row)"
              @click="handleCheck(scope.$index, scope.row)"></i>
          </template>
        </el-table-column>
      </el-table>
      <div style="text-align: center;margin-top: 30px;">

        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
          :current-page="page.pageNum" :page-sizes="[5, 10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper" :total="page.total">
        </el-pagination>

      </div>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible" :width="width"
        :close-on-click-modal="false" :close-on-press-escape="false" :before-close="handleClose">
        <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px">
          <el-form-item label="名称">
            <el-input v-model="temp.name" placeholder="请输入报销名称" style="width:100%" />
          </el-form-item>
          <el-form-item label="日期" prop="applyTime">
            <el-date-picker v-model="temp.applyTime" type="datetime" placeholder="请选择一个时间" style="width:100%" />
          </el-form-item>
          <el-form-item label="审核人" prop="verifierName">
            <el-autocomplete popper-class="my-autocomplete" style="width:100%" v-model="temp.verifierName"
              :fetch-suggestions="querySearch" placeholder="请选择审核人" @select="handleSelect3" class="filter-item">
              <template slot-scope="{ item }">
                <div class="name">{{ item.value }} <span class="id">{{ item.id }}</span></div>
              </template>
            </el-autocomplete>
          </el-form-item>

          <el-form-item label="金额">
            <el-input v-model="temp.cost" style="width:100%" placeholder="请输入报销金额" />
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm('dataForm')">确 定</el-button>
        </span>
      </el-dialog>
    </div>

  </div>



</template>
<script>
  import {
    date
  } from 'jszip/lib/defaults';
  export default {
    data() {
      return {
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },

        width: this.initWidth(),
        currentUser: {},
        users: [],
        timeout: null,

        options: [{
          value: '1',
          label: '申请中',
        }, {
          value: '2',
          label: '报销中',
        }, {
          value: '3',
          label: '报销成功',
        }, {
          value: '4',
          label: '申请失败',
        }, {
          value: '0',
          label: '查看所有',
        }],
        tableData: [],
        dialogFormVisible: false,
        dialogStatus: "",
        page: {
          pageNum: 1,
          pageSize: 10,
          field: '',
          order: '',
          total: 0
        },
        proposerName: '',
        verifierName: '',
        temp: {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: new Date(),
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '1',
          taskId: '',
          proposerName: '',
          verifierName: '',
        },
        funding: {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: '',
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '',
          taskId: ''
        },
        textMap: {
          update: '编辑',
          create: '添加'
        },
        rules: {
          name: [{
            required: true,
            message: '报销名称不能为空',
            trigger: 'blur'
          }],
          applyTime: [{
            required: true,
            message: '报销时间未选择',
            trigger: 'blur'
          }],
          proposerName: [{
            required: true,
            message: '申请人不能为空',
            trigger: 'change'
          }],
          verifierName: [{
            required: true,
            message: '审核人不能为空',
            trigger: 'change'
          }],
          cost: [{
            required: true,
            message: '报销金额不能为空',
            trigger: 'blur'
          }],
        },
      }
    },
    filters: {
      BXStatusFilter(state) {
        const map = {
          1: "",
          2: "warning",
          3: "success",
          4: "danger"
        }
        return map[state]
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
      loadUser() {
        return [{
            "value": "张三",
            "id": "20180407430111"
          },
          {
            "value": "李四",
            "id": "2"
          },
          {
            "value": "王五",
            "id": "3"
          },
          {
            "value": "张三",
            "id": "4"
          },
        ];
      },

      loadTable() {
        var param = this.page;
        var funding = this.funding;
        this.$get('studio/funding', {
          param,
          funding
        }).then((r) => {
          return r;
          this.$message({
            message: "搜索成功",
            type: 'success'
          })
        })
        // return [{
        //   id: '1',
        //   state: '4',
        //   stateText: '申请失败',
        //   applyTime: '2020-7-10',
        //   proposerId: '123',
        //   verifierId: '456',
        //   certifierId: '',
        //   cost: '5',
        //   name: '车费',
        //   proposerName: '张三',
        //   verifierName: '李四',
        // }, {
        //   id: '1',
        //   state: '1',
        //   stateText: '申请中',
        //   applyTime: '2020-7-10',
        //   proposerId: '123',
        //   verifierId: '456',
        //   certifierId: '',
        //   cost: '6',
        //   name: '水费',
        //   proposerName: '张三',
        //   verifierName: '李四',
        // }, {
        //   id: '1',
        //   state: '1',
        //   stateText: '申请中',
        //   applyTime: '2020-7-10',
        //   proposerId: '123',
        //   verifierId: '456',
        //   certifierId: '',
        //   cost: '7',
        //   name: '网费',
        //   proposerName: '张三',
        //   verifierName: '李四',
        // },{
        //   id: '1',
        //   state: '2',
        //   stateText: '报销中',
        //   applyTime: '2020-7-10',
        //   proposerId: '123',
        //   verifierId: '456',
        //   certifierId: '',
        //   cost: '7',
        //   name: '网费',
        //   proposerName: '张三',
        //   verifierName: '李四',
        // },{
        //   id: '1',
        //   state: '3',
        //   stateText: '申请成功',
        //   applyTime: '2020-7-10',
        //   proposerId: '123',
        //   verifierId: '456',
        //   certifierId: '',
        //   cost: '7',
        //   name: '网费',
        //   proposerName: '张三',
        //   verifierName: '李四',
        // }]
      },

      querySearch(queryString, cb) {
        var users = this.users;
        var results = queryString ? users.filter(this.createFilter(queryString)) : users;
        cb(results);
      },
      createFilter(queryString) {
        return (restaurant) => {
          return (restaurant.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      createStateFilter(queryString) {
        return (state) => {
          return (state.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0);
        };
      },
      handleSearch() {
        this.tableData = this.loadTable().data.rows;
        this.page.size = this.loadTable().data.total;
      },
      handleJudge(index, row) {
        if (row.state == 1 && this.currentUser.roleId == 1) return true;
        return false;
      },
      handleSelect1(item) {
        this.funding.proposerId = item.id;
      },
      handleSelect2(item) {
        this.funding.verifierId = item.id;
      },
      handleSelect3(item) {
        this.temp.verifierId = item.id;
      },
      handleSelect4(item) {
        this.temp.proposerId = item.id;
      },
      handleIconClick(ev) {
        console.log(ev);
      },
      handleUpdate(row) {
        if (row.state == 1 || row.state == 4) {
          this.temp = Object.assign({}, row)
          this.temp.date = new Date(this.temp.applyTime)
          this.dialogStatus = 'update'
          this.dialogFormVisible = true
          this.$nextTick(() => {
            this.$refs['dataForm'].clearValidate()
          })
        } else {
          this.$message({
            type: 'error',
            message: '该申报已受理 或 申报尚未失败，不能修改。'
          });
        }
      },
      handleDelete(index, row) {
        this.$confirm('此操作将删除该项申报, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          if (row.state != 4) {
            this.$message({
              type: 'error',
              message: '删除失败!  申请失败可删除，其它均不能删除'
            });
          } else {
            this.$delete(`studio/funding/${row.id}`).then(() => {
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
              this.handleSearch();
            })
          }
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消删除'
          });
        });
      },
      handleCheck(index, row) {
        this.$confirm('此操作将接受该项申报, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.$put('studio/funding/state', {
            row
          }).then(() => {
            this.handleSearch();
            this.$message({
              type: 'success',
              message: '已通过该申报!'
            });
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消通过该项目'
          });
        });
      },
      handleSizeChange(val) {
        this.page.pageSize = val;
      },
      handleCurrentChange(val) {
        this.page.pageNum = val;
      },
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      resetTemp() {
        this.temp = {
          id: '',
          verifierId: '',
          certifierId: '',
          name: '',
          type: '',
          applyTime: new Date(),
          successTime: '',
          invoice: '',
          cost: '',
          card: '',
          proposerId: '',
          state: '1',
          taskId: ''
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      filterBXStatus(value, row) {
        return row.state == value
      },
      create(formName) {
        this.temp.proposerId = this.currentUser.userId;
        const funding = this.temp;
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$post('studio/funding/', {
              funding
            }).then(() => {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
            })
            this.dialogFormVisible = false;
          } else {
            return false;
          }
        });
      },
      update(formName) {
        const funding = this.temp;
        console.log(funding);
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$put('studio/funding/', {
              funding
            }).then(() => {
              this.$message({
                message: '添加成功',
                type: 'success'
              })
            })
            this.dialogFormVisible = false;
          } else {
            return false;
          }
        });
      },
      submitForm(formName) {
        if (this.dialogStatus == 'update') {
          this.update(formName);
        } else if (this.dialogStatus == 'create') {
          this.create(formName);
        }
        this.handleSearch()
      },
      initUsers() {
        this.users = this.loadUser();
      },
      initCurrentUser() {
        this.currentUser = this.$store.state.account.user;
      },
      initTableData() {
        this.handleSearch();
      }
    },
    mounted() {
      this.initUsers();
      this.initCurrentUser();
      this.initTableData();
      window.onresize = () => {
        return (() => {
          this.width = this.initWidth()
        })()
      }
    }
  }

</script>
<style lang="scss" scoped>
  .menu {
    margin: 10px;

    .app-container {
      margin: 0 0 10px 0 !important;
    }
  }

  .el-card.is-always-shadow {
    box-shadow: none;
  }

  .el-card {
    border-radius: 0;
    border: none;

    .el-card__header {
      padding: 10px 20px !important;
      border-bottom: 1px solid #f1f1f1 !important;
    }
  }

  .my-autocomplete {
    li {
      line-height: normal;
      padding: 7px;

      .name {
        text-overflow: ellipsis;
        overflow: hidden;
      }

      .id {
        font-size: 12px;
        color: #b4b4b4;
        position: absolute;
        right: 5px;
      }

      .highlighted .id {
        color: #ddd;
      }
    }
  }

</style>
</style>
